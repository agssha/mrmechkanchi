const { Customer, ReferralCode, Referral, Coupon, RewardLog, ReferralConfig, Booking } = require("../models");
const AppError = require("../utils/appError");
const emailService = require("./emailService");
const logger = require("../utils/logger");

class ReferralService {
    /**
     * Generate a unique uppercase referral code based on customer's name
     */
    async generateUniqueCode(name) {
        const prefix = (name || "MECH")
            .replace(/[^a-zA-Z]/g, "")
            .substring(0, 4)
            .toUpperCase() || "MECH";
        
        let code = "";
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
            code = `${prefix}${rand}`;
            const existing = await Customer.findOne({ referralCode: code });
            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        // Fallback to random alphanumeric if prefix-based fails
        if (!isUnique) {
            code = Math.random().toString(36).substring(2, 10).toUpperCase();
        }
        return code;
    }

    /**
     * Sync Supabase customer profile into MongoDB
     */
    async syncCustomerProfile(data, clientIp, userAgent) {
        const { userId, email, name, phone } = data;

        if (!email) {
            throw new AppError("Email is required to sync customer profile", 400);
        }

        let customer = await Customer.findOne({ email: email.toLowerCase() });

        if (!customer) {
            // New Customer Registration
            const refCode = await this.generateUniqueCode(name);
            customer = await Customer.create({
                userId,
                name,
                email: email.toLowerCase(),
                phone: phone || "",
                referralCode: refCode,
                ipAddresses: clientIp ? [clientIp] : [],
                userAgentFingerprints: userAgent ? [userAgent] : []
            });

            // Also create normalized ReferralCode document
            await ReferralCode.create({
                code: refCode,
                customerId: customer._id
            });

            logger.info(`👥 Customer Profile Sync: Created new customer ${customer.email} with code ${customer.referralCode}`);
        } else {
            // Existing Customer Updates
            let modified = false;
            if (userId && customer.userId !== userId) {
                customer.userId = userId;
                modified = true;
            }
            if (name && customer.name !== name) {
                customer.name = name;
                modified = true;
            }
            if (phone && customer.phone !== phone) {
                customer.phone = phone;
                modified = true;
            }
            if (clientIp && !customer.ipAddresses.includes(clientIp)) {
                customer.ipAddresses.push(clientIp);
                modified = true;
            }
            if (userAgent && !customer.userAgentFingerprints.includes(userAgent)) {
                customer.userAgentFingerprints.push(userAgent);
                modified = true;
            }

            if (modified) {
                await customer.save();
            }
        }

        return customer;
    }

    /**
     * Submit referral code during checkout or in the dashboard
     */
    async submitReferralCode(referredId, referralCode, clientIp, userAgent) {
        if (!referralCode) {
            throw new AppError("Referral code is required", 400);
        }

        const cleanCode = referralCode.trim().toUpperCase();

        // 1. Fetch referred customer details
        const referredCustomer = await Customer.findById(referredId);
        if (!referredCustomer) {
            throw new AppError("Referred customer profile not found", 404);
        }

        // 2. Prevent overriding existing referral configuration
        if (referredCustomer.referredByCustomer) {
            throw new AppError("You have already been referred by another user.", 400);
        }

        // 3. Find referrer by code
        const referrerCodeDoc = await ReferralCode.findOne({ code: cleanCode, isActive: true });
        if (!referrerCodeDoc) {
            throw new AppError("Invalid or inactive referral code.", 400);
        }

        const referrer = await Customer.findById(referrerCodeDoc.customerId);
        if (!referrer) {
            throw new AppError("Referrer profile not found", 404);
        }

        // 4. SECURITY CHECKS (Anti-abuse and fraud prevention)
        // Check A: Self-referral
        if (referrer._id.equals(referredCustomer._id)) {
            throw new AppError("You cannot refer yourself.", 400);
        }

        // Check B: Identical phone numbers
        if (referrer.phone && referredCustomer.phone && referrer.phone.trim() === referredCustomer.phone.trim()) {
            throw new AppError("Self-referral detected via matching phone numbers.", 400);
        }

        // Check C: Device/IP matches
        const hasMatchingIp = clientIp && (referrer.ipAddresses.includes(clientIp) || referredCustomer.ipAddresses.includes(clientIp));
        const hasMatchingUserAgent = userAgent && (referrer.userAgentFingerprints.includes(userAgent) || referredCustomer.userAgentFingerprints.includes(userAgent));
        
        // Wait, IP might change or match on public Wi-Fi, but if BOTH match or we log it as suspicious.
        // Let's prevent self-referral through exact matching IP or exact matching device details if it matches the current request
        if (clientIp && referrer.ipAddresses.includes(clientIp)) {
            logger.warn(`⚠️ Fraud Warning: Device/IP overlap. ${referredCustomer.email} referred by ${referrer.email} shares IP ${clientIp}`);
            // Let's block self-referrals sharing the exact same IP address to prevent fake accounts.
            throw new AppError("Referral rejected. Self-referral protection triggered via IP sharing.", 400);
        }

        // Check D: Referred customer must be a new customer (no completed bookings)
        const completedBookings = await Booking.findOne({
            userEmail: referredCustomer.email,
            status: "completed",
            paymentStatus: "Paid"
        });
        if (completedBookings) {
            throw new AppError("Referral valid for new customers only. You have already completed service bookings.", 400);
        }

        // 5. Update referred customer
        referredCustomer.referredByCode = cleanCode;
        referredCustomer.referredByCustomer = referrer._id;
        await referredCustomer.save();

        // 6. Create a pending referral entry
        const existingReferral = await Referral.findOne({ referredId: referredCustomer._id });
        if (existingReferral) {
            existingReferral.referrerId = referrer._id;
            existingReferral.status = "Pending";
            await existingReferral.save();
            return existingReferral;
        }

        const referral = await Referral.create({
            referrerId: referrer._id,
            referredId: referredCustomer._id,
            status: "Pending"
        });

        logger.info(`🔗 Referral Connected: ${referredCustomer.email} referred by ${referrer.email} (Pending completion)`);
        return referral;
    }

    /**
     * Mark a referral as completed and check for coupon generation triggers.
     * Triggered automatically when a booking is paid and completed.
     */
    async validateAndCompleteReferral(referredCustomerId, bookingId, serviceCharge) {
        // Find pending referral
        const referral = await Referral.findOne({ referredId: referredCustomerId, status: "Pending" });
        if (!referral) {
            return null; // No pending referral found, ignore
        }

        const referredCustomer = await Customer.findById(referredCustomerId);
        const referrer = await Customer.findById(referral.referrerId);

        if (!referredCustomer || !referrer) {
            logger.error(`❌ Referral Validation Error: Referred/Referrer customer objects not found.`);
            return null;
        }

        // Double check if this is indeed the customer's FIRST completed booking in the DB
        const completedBookingsCount = await Booking.countDocuments({
            userEmail: referredCustomer.email,
            status: "completed",
            paymentStatus: "Paid"
        });

        // The current booking is already completed, so count must be exactly 1 for it to be the first!
        if (completedBookingsCount > 1) {
            referral.status = "Rejected";
            referral.rejectionReason = "Not a first-time customer service completion";
            await referral.save();
            logger.warn(`❌ Referral Rejected: Customer ${referredCustomer.email} is not new (Completed services: ${completedBookingsCount})`);
            return referral;
        }

        // Update referral status to Completed
        referral.status = "Completed";
        referral.bookingId = bookingId;
        referral.serviceCharge = serviceCharge;
        referral.completedAt = new Date();
        await referral.save();

        // Create log of reward event
        await RewardLog.create({
            customerId: referrer._id,
            type: "REFERRAL_COMPLETED",
            details: `Referral of ${referredCustomer.name} (${referredCustomer.email}) successfully validated.`
        });

        logger.info(`✅ Referral Successfully Validated: ${referredCustomer.email} referred by ${referrer.email}`);

        // Notify referrer that referral is completed
        emailService.sendReferralCompletedEmail(referrer.email, referrer.name, referredCustomer.name)
            .catch(err => logger.error(`Email Alert Error: ${err.message}`));

        // Trigger milestone verification
        await this.checkAndGenerateReward(referrer._id);

        return referral;
    }

    /**
     * Check if referrer is eligible for a reward coupon based on completed referrals
     */
    async checkAndGenerateReward(referrerId) {
        const config = await ReferralConfig.findOne() || {
            referralTarget: 3,
            rewardPercentage: 25,
            couponExpiryDays: 90,
            maxDiscountAmount: 500
        };

        const referrer = await Customer.findById(referrerId);
        if (!referrer) return;

        // Count completed referrals for this referrer
        const completedCount = await Referral.countDocuments({
            referrerId: referrerId,
            status: "Completed"
        });

        // Count coupons already earned by this user
        const couponsEarned = await Coupon.countDocuments({
            customerId: referrerId,
            couponType: "REFERRAL_REWARD"
        });

        // Determine how many coupons they SHOULD have earned
        const expectedCoupons = Math.floor(completedCount / config.referralTarget);

        if (expectedCoupons > couponsEarned) {
            const couponsToGenerate = expectedCoupons - couponsEarned;

            for (let i = 0; i < couponsToGenerate; i++) {
                // Generate Unique Coupon
                const couponCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + config.couponExpiryDays);

                await Coupon.create({
                    code: couponCode,
                    customerId: referrer._id,
                    discountPercentage: config.rewardPercentage,
                    maxDiscount: config.maxDiscountAmount,
                    expiryDate,
                    referralCountTrigger: config.referralTarget
                });

                await RewardLog.create({
                    customerId: referrer._id,
                    type: "COUPON_GENERATED",
                    details: `Earned 25% discount coupon ${couponCode} for successfully completing referral milestones.`,
                    pointsOrValue: config.maxDiscountAmount
                });

                logger.info(`🎁 Coupon Generated: ${couponCode} created for customer ${referrer.email}`);

                // Send email notification to referrer about the coupon
                emailService.sendCouponGeneratedEmail(referrer.email, referrer.name, couponCode, config.rewardPercentage, config.maxDiscountAmount, expiryDate)
                    .catch(err => logger.error(`Email Coupon Alert Error: ${err.message}`));
            }
        }
    }

    /**
     * Fetch referral details for the dashboard
     */
    async getCustomerReferralDetails(userIdOrCustomerEmail) {
        // Query by either supabase user ID or email
        const customer = await Customer.findOne({
            $or: [{ userId: userIdOrCustomerEmail }, { email: String(userIdOrCustomerEmail).toLowerCase() }]
        });

        if (!customer) {
            // Return fallback dashboard structure to gracefully handle sync latency
            return {
                referralCode: "------",
                referralLink: "#",
                successfulReferrals: 0,
                totalReferrals: 0,
                progressIndicator: "0/3",
                progressPercentage: 0,
                targetNeeded: 3,
                referredFriends: [],
                coupons: []
            };
        }

        // Get completed referrals
        const successfulCount = await Referral.countDocuments({
            referrerId: customer._id,
            status: "Completed"
        });

        // Total referrals (including pending)
        const totalReferrals = await Referral.countDocuments({
            referrerId: customer._id
        });

        // Get list of referrals with names/status
        const referralsList = await Referral.find({ referrerId: customer._id })
            .populate("referredId", "name email phone")
            .sort({ createdAt: -1 });

        // Get active rewards/coupons
        const coupons = await Coupon.find({ customerId: customer._id }).sort({ createdAt: -1 });

        // Get config to calculate progress
        const config = await ReferralConfig.findOne() || { referralTarget: 3 };
        const progressCount = successfulCount % config.referralTarget;

        return {
            referralCode: customer.referralCode,
            referralLink: `https://www.mrkanchi.in/booking?ref=${customer.referralCode}`,
            successfulReferrals: successfulCount,
            totalReferrals: totalReferrals,
            progressIndicator: `${progressCount}/${config.referralTarget}`,
            progressPercentage: Math.min(100, Math.round((progressCount / config.referralTarget) * 100)),
            targetNeeded: config.referralTarget,
            referredFriends: referralsList.map(ref => ({
                id: ref._id,
                name: ref.referredId?.name || "Friend",
                email: ref.referredId?.email ? `${ref.referredId.email.substring(0, 3)}***@***` : "Hidden",
                status: ref.status,
                createdAt: ref.createdAt
            })),
            coupons: coupons.map(c => {
                const now = new Date();
                const expired = new Date(c.expiryDate) < now;
                let status = "Active";
                if (c.isUsed) status = "Redeemed";
                else if (expired) status = "Expired";

                return {
                    id: c._id,
                    code: c.code,
                    discountPercentage: c.discountPercentage,
                    maxDiscount: c.maxDiscount,
                    expiryDate: c.expiryDate,
                    status
                };
            })
        };
    }

    /**
     * Validate Coupon validity for a checkout booking request
     */
    async validateCoupon(code, customerEmail, serviceCharge) {
        if (!code) throw new AppError("Coupon code is required", 400);

        const customer = await Customer.findOne({ email: customerEmail.toLowerCase() });
        if (!customer) throw new AppError("Customer profile not found. Please log in first.", 404);

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (!coupon) throw new AppError("Invalid coupon code.", 400);

        if (coupon.isUsed) throw new AppError("This coupon has already been redeemed.", 400);

        if (new Date(coupon.expiryDate) < new Date()) {
            throw new AppError("This coupon has expired.", 400);
        }

        // Verify coupon ownership
        if (!coupon.customerId.equals(customer._id)) {
            throw new AppError("This coupon belongs to another customer account.", 400);
        }

        // Coupon is only valid for the service charge.
        // Discount is coupon.discountPercentage % of service charge up to coupon.maxDiscount
        const discountAmount = Math.min(
            Math.round(serviceCharge * (coupon.discountPercentage / 100)),
            coupon.maxDiscount
        );

        return {
            coupon,
            discountAmount,
            finalServiceCharge: Math.max(0, serviceCharge - discountAmount)
        };
    }
}

module.exports = new ReferralService();
