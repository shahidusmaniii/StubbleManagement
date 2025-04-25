const nodemailer = require('nodemailer');
const { createTestAccount: nodeCreateTestAccount, createTransport, getTestMessageUrl } = require('nodemailer');

// Create primary Gmail transporter
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true // Enable debug output
});

// Create a fallback transporter using ethereal.email (for testing)
let testTransporter = null;

// Function to create test account if gmail fails
const createLocalTestAccount = async () => {
    try {
        const testAccount = await nodeCreateTestAccount();
        console.log('Created test account:', testAccount.user);
        
        testTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        
        return {
            success: true,
            user: testAccount.user,
            pass: testAccount.pass
        };
    } catch (err) {
        console.error('Error creating test account:', err);
        return { success: false, error: err.message };
    }
};

// Verify Gmail transporter configuration on startup
gmailTransporter.verify(function(error, success) {
    if (error) {
        console.error('Gmail configuration error:', error);
        console.log('Will attempt to use ethereal.email as fallback');
        createLocalTestAccount();
    } else {
        console.log('Email server is ready to send messages');
    }
});

const sendVerificationEmail = async (email, token, userType) => {
    try {
        console.log(`Attempting to send verification email to ${email} with token ${token}`);
        
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&type=${userType}`;
        console.log('Verification URL:', verificationUrl);
        
        const mailOptions = {
            from: `"Stubble Management" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification - Stubble Management',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #036A48; text-align: center;">Email Verification</h1>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with Stubble Management. Please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #036A48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">If you did not create an account, you can safely ignore this email.</p>
                    <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style="font-size: 14px; word-break: break-all; color: #0066cc;">${verificationUrl}</p>
                </div>
            `
        };

        try {
            // First try with Gmail
            console.log('Attempting to send with Gmail...');
            const info = await gmailTransporter.sendMail(mailOptions);
            console.log('Email sent successfully with Gmail:', info.messageId);
            return { 
                success: true, 
                service: 'gmail',
                messageId: info.messageId 
            };
        } catch (gmailError) {
            console.error('Gmail send error:', gmailError);
            
            // If Gmail fails, try with test account
            if (!testTransporter) {
                console.log('Creating test account...');
                await createLocalTestAccount();
            }
            
            if (testTransporter) {
                try {
                    console.log('Attempting to send with Ethereal...');
                    const testInfo = await testTransporter.sendMail(mailOptions);
                    console.log('Email sent with test account. Preview URL:', nodemailer.getTestMessageUrl(testInfo));
                    return { 
                        success: true, 
                        service: 'ethereal',
                        messageId: testInfo.messageId,
                        previewUrl: nodemailer.getTestMessageUrl(testInfo)
                    };
                } catch (testError) {
                    console.error('Test account send error:', testError);
                    throw new Error(`Gmail error: ${gmailError.message}, Test error: ${testError.message}`);
                }
            } else {
                throw gmailError;
            }
        }
    } catch (err) {
        console.error('Error sending verification email:', err);
        throw err;
    }
};

// Test function to quickly check email functionality
const sendTestEmail = async (testEmail) => {
    try {
        console.log(`Sending test email to ${testEmail}`);
        
        const mailOptions = {
            from: `"Stubble Management Test" <${process.env.EMAIL_USER}>`,
            to: testEmail,
            subject: 'Test Email - Stubble Management',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #036A48; text-align: center;">Test Email</h1>
                    <p style="font-size: 16px; line-height: 1.5;">This is a test email from Stubble Management to verify that the email system is working correctly.</p>
                    <p style="font-size: 14px; color: #666;">If you received this, the email configuration is working!</p>
                </div>
            `
        };

        try {
            // First try with Gmail
            console.log('Attempting to send test with Gmail...');
            const info = await gmailTransporter.sendMail(mailOptions);
            console.log('Test email sent successfully with Gmail:', info.messageId);
            return {
                success: true,
                service: 'gmail',
                messageId: info.messageId
            };
        } catch (gmailError) {
            console.error('Gmail test send error:', gmailError);
            
            // If Gmail fails, try with test account
            if (!testTransporter) {
                console.log('Creating test account for test email...');
                await createLocalTestAccount();
            }
            
            if (testTransporter) {
                try {
                    console.log('Attempting to send test with Ethereal...');
                    const testInfo = await testTransporter.sendMail(mailOptions);
                    console.log('Test email sent with Ethereal. Preview URL:', nodemailer.getTestMessageUrl(testInfo));
                    return { 
                        success: true, 
                        service: 'ethereal',
                        messageId: testInfo.messageId,
                        previewUrl: nodemailer.getTestMessageUrl(testInfo)
                    };
                } catch (testError) {
                    console.error('Test account send error:', testError);
                    throw new Error(`Gmail error: ${gmailError.message}, Test error: ${testError.message}`);
                }
            } else {
                throw gmailError;
            }
        }
    } catch (err) {
        console.error('Error sending test email:', err);
        return {
            success: false,
            error: err.message
        };
    }
};

const sendWinnerNotification = async (winnerEmail, winnerName, bidAmount, roomName) => {
    try {
        console.log(`Sending winner notification to ${winnerEmail}`);
        
        const mailOptions = {
            from: `"Stubble Management" <${process.env.EMAIL_USER}>`,
            to: winnerEmail,
            subject: 'Congratulations! You Won the Auction',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #036A48; text-align: center;">Congratulations ${winnerName}!</h1>
                    <p style="font-size: 16px; line-height: 1.5;">You have won the auction for "${roomName}" with your bid of ₹${bidAmount}.</p>
                    <p style="font-size: 16px; line-height: 1.5;">Our team will contact you shortly to arrange the delivery of the stubble.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <h3 style="color: #036A48;">Auction Details:</h3>
                        <p><strong>Room Name:</strong> ${roomName}</p>
                        <p><strong>Your Winning Bid:</strong> ₹${bidAmount}</p>
                    </div>
                    <p style="font-size: 14px; color: #666;">Thank you for participating in our auction system.</p>
                </div>
            `
        };

        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('Winner notification sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Error sending winner notification:', err);
        throw err;
    }
};

const sendAdminAuctionEndNotification = async (adminEmail, winnerName, winnerEmail, bidAmount, roomName) => {
    try {
        console.log(`Sending admin notification about auction end to ${adminEmail}`);
        
        const mailOptions = {
            from: `"Stubble Management" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: 'Auction Completed - Action Required',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #036A48; text-align: center;">Auction Completed</h1>
                    <p style="font-size: 16px; line-height: 1.5;">The auction for "${roomName}" has been completed.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <h3 style="color: #036A48;">Winner Details:</h3>
                        <p><strong>Winner Name:</strong> ${winnerName}</p>
                        <p><strong>Winner Email:</strong> ${winnerEmail}</p>
                        <p><strong>Winning Bid:</strong> ₹${bidAmount}</p>
                        <p><strong>Auction Room:</strong> ${roomName}</p>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">Please arrange for the stubble to be delivered to the winner.</p>
                </div>
            `
        };

        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('Admin notification sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Error sending admin notification:', err);
        throw err;
    }
};

module.exports = { 
    sendVerificationEmail,
    sendTestEmail,
    sendWinnerNotification,
    sendAdminAuctionEndNotification,
    gmailTransporter,
    createLocalTestAccount
}; 