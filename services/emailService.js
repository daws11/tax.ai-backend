import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || 're_jHq6GsG7_AQujdZ4kys3nEHvWJazM6afD');

class EmailService {
  constructor() {
    // Use verified domain for production
    this.fromEmail = 'no-reply@taxai.ae';
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send verification email
  async sendVerificationEmail(email, verificationUrl) {
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Registration - TaxAI</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
          }
          
          .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .logo {
            height: 50px;
            width: auto;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
          }
          
          .main-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .cta-section {
            text-align: center;
            margin: 35px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 12px;
            border: 2px solid #e2e8f0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 36px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin: 20px 0;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          
          .link-fallback {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          
          .link-fallback p {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 10px;
          }
          
          .verification-link {
            word-break: break-all;
            color: #667eea;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #e9ecef;
          }
          
          .steps-section {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          
          .steps-section h3 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .steps-section h3::before {
            content: "📋";
            margin-right: 10px;
            font-size: 20px;
          }
          
          .steps-list {
            list-style: none;
            padding: 0;
          }
          
          .steps-list li {
            padding: 8px 0;
            color: #4a5568;
            font-size: 15px;
            position: relative;
            padding-left: 25px;
          }
          
          .steps-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #48bb78;
            font-weight: bold;
            font-size: 16px;
          }
          
          .security-notice {
            margin: 25px 0;
            padding: 20px;
            background: #fff5f5;
            border-radius: 8px;
            border-left: 4px solid #f56565;
          }
          
          .security-notice p {
            color: #c53030;
            font-size: 14px;
            font-weight: 500;
          }
          
          .footer {
            background: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
            font-size: 14px;
          }
          
          .footer-content {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .footer-logo {
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 15px;
          }
          
          .footer-links {
            margin: 15px 0;
          }
          
          .footer-links a {
            color: #a0aec0;
            text-decoration: none;
            margin: 0 10px;
          }
          
          .footer-links a:hover {
            color: #ffffff;
          }
          
          .copyright {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #4a5568;
            font-size: 12px;
            opacity: 0.8;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .logo-container {
              flex-direction: column;
              gap: 10px;
            }
            
            .logo {
              height: 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <img src="https://www.taxai.ae/lovable-uploads/logo%20circle.png" alt="TaxAI Logo" class="logo">
              <img src="https://taxai.ae/lovable-uploads/logo-new.png" alt="TaxAI Brand" class="logo">
            </div>
            <h1>Complete Your Registration</h1>
            <p>Welcome to TaxAI - Your AI-Powered Tax Assistant</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello! 👋</div>
            
            <div class="main-text">
              Thank you for choosing TaxAI! We're excited to have you join our community of professionals who trust our AI-powered tax solutions. To complete your account setup and unlock access to our advanced features, please verify your email address.
            </div>
            
            <div class="cta-section">
              <a href="${verificationUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">
                🚀 Complete Registration
              </a>
              
              <div class="link-fallback">
                <p><strong>Button not working?</strong></p>
                <p>Copy and paste this link into your browser:</p>
                <div class="verification-link">${verificationUrl}</div>
              </div>
            </div>
            
            <div class="steps-section">
              <h3>What happens next?</h3>
              <ul class="steps-list">
                <li>Verify your email address (you're almost there!)</li>
                <li>Complete your professional profile</li>
                <li>Choose your perfect subscription plan</li>
                <li>Access our AI-powered tax features</li>
                <li>Get expert support whenever you need it</li>
              </ul>
            </div>
            
            <div class="security-notice">
              <p><strong>🔒 Security Notice:</strong> This verification link will expire in 24 hours for your security. If you didn't start this registration, please ignore this email.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #4a5568; font-size: 15px;">
                Best regards,<br>
                <strong>The TaxAI Team</strong><br>
                <span style="color: #718096; font-size: 14px;">Your trusted AI tax assistant</span>
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-logo">TaxAI</div>
              <p>Empowering professionals with AI-driven tax solutions</p>
              
              <div class="footer-links">
                <a href="https://taxai.ae">Website</a>
                <a href="https://taxai.ae/support">Support</a>
                <a href="https://taxai.ae/privacy">Privacy</a>
                <a href="https://taxai.ae/terms">Terms</a>
              </div>
              
              <div class="copyright">
                © 2024 TaxAI. All rights reserved. This email was sent to ${email}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('Sending verification email to:', email);
      console.log('From email:', this.fromEmail);
      console.log('Verification URL:', verificationUrl);
      console.log('API Key:', process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET');
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify Your Email - TaxAI',
        html: htmlContent
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, name) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TaxAI!</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
          }
          
          .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .logo {
            height: 50px;
            width: auto;
            filter: brightness(0) invert(1);
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
          }
          
          .main-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .success-section {
            text-align: center;
            margin: 35px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
            border-radius: 12px;
            border: 2px solid #9ae6b4;
          }
          
          .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 36px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin: 20px 0;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          
          .features-section {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          
          .features-section h3 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .features-section h3::before {
            content: "🚀";
            margin-right: 10px;
            font-size: 20px;
          }
          
          .features-list {
            list-style: none;
            padding: 0;
          }
          
          .features-list li {
            padding: 8px 0;
            color: #4a5568;
            font-size: 15px;
            position: relative;
            padding-left: 25px;
          }
          
          .features-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #48bb78;
            font-weight: bold;
            font-size: 16px;
          }
          
          .footer {
            background: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
            font-size: 14px;
          }
          
          .footer-content {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .footer-logo {
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 15px;
          }
          
          .footer-links {
            margin: 15px 0;
          }
          
          .footer-links a {
            color: #a0aec0;
            text-decoration: none;
            margin: 0 10px;
          }
          
          .footer-links a:hover {
            color: #ffffff;
          }
          
          .copyright {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #4a5568;
            font-size: 12px;
            opacity: 0.8;
          }
          
          @media (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 8px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .logo-container {
              flex-direction: column;
              gap: 10px;
            }
            
            .logo {
              height: 40px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
<img src="https://www.taxai.ae/lovable-uploads/logo%20circle.png" alt="TaxAI Logo" class="logo">
              <img src="https://taxai.ae/lovable-uploads/logo-new.png" alt="TaxAI Brand" class="logo">
            </div>
            <h1>Welcome to TaxAI! 🎉</h1>
            <p>Your account is now fully activated and ready to use</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${name}! 👋</div>
            
            <div class="main-text">
              Congratulations! Your TaxAI account has been successfully verified and is now fully activated. You're now part of our community of professionals who trust our AI-powered tax solutions.
            </div>
            
            <div class="success-section">
              <div class="success-icon">✅</div>
              <h2 style="color: #2f855a; margin-bottom: 15px;">Account Successfully Verified!</h2>
              <p style="color: #4a5568; margin-bottom: 25px;">Your email has been verified and your account is ready to use.</p>
              
              <a href="https://dashboard.taxai.ae/" class="cta-button" target="_blank" rel="noopener noreferrer">
                🚀 Go to Dashboard
              </a>
            </div>
            
            <div class="features-section">
              <h3>What you can do now:</h3>
              <ul class="features-list">
                <li>Access your personalized dashboard</li>
                <li>Use our AI-powered tax analysis tools</li>
                <li>Manage your subscription and billing</li>
                <li>Get expert support whenever you need it</li>
                <li>Access comprehensive tax resources</li>
                <li>Connect with our professional community</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #4a5568; font-size: 15px;">
                Welcome to the future of tax management!<br>
                <strong>The TaxAI Team</strong><br>
                <span style="color: #718096; font-size: 14px;">Your trusted AI tax assistant</span>
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="footer-logo">TaxAI</div>
              <p>Empowering professionals with AI-driven tax solutions</p>
              
              <div class="footer-links">
                <a href="https://taxai.ae">Website</a>
                <a href="https://taxai.ae/support">Support</a>
                <a href="https://taxai.ae/privacy">Privacy</a>
                <a href="https://taxai.ae/terms">Terms</a>
              </div>
              
              <div class="copyright">
                © 2024 TaxAI. All rights reserved. This email was sent to ${email}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('Sending welcome email to:', email);
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to TaxAI - Your Account is Ready!',
        html: htmlContent
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
      }

      console.log('Welcome email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }
}

export default new EmailService(); 