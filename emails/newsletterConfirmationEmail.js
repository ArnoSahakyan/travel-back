export const generateNewsletterConfirmationEmail = ({ token }) => {
    const verificationLink = `${process.env.CORS}/newsletter/verify?token=${token}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Subscription</title>
      <style>
        body {
          font-family: 'Poppins', Arial, sans-serif;
          background-color: #F5F7FA;
          color: #4A5568;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #F5F7FA;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #2A7A7B;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #FFFFFF;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
        }
        .logo {
          color: #2A7A7B;
          font-weight: bold;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }
        h2 {
          color: #2A7A7B;
          font-size: 20px;
          margin-top: 0;
        }
        p {
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #2A7A7B;
          color: #FFFFFF !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background-color: #2A7A7B;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #FFFFFF;
        }
        .expiry-note {
          color: #E07A5F;
          font-size: 14px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WanderLuxe</h1>
        </div>
        
        <div class="content">
          <div class="logo">WanderLuxe</div>
          
          <h2>One Last Step!</h2>
          
          <p>Thank you for subscribing to the WanderLuxe newsletter. We're excited to share exclusive travel deals, insider tips, and inspiring destinations with you.</p>
          
          <p>To complete your subscription and start receiving our emails, please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Confirm Subscription</a>
          </div>
          
          <p class="expiry-note">This confirmation link will expire in 1 hour.</p>
          
          <p>If you didn't request this subscription, you can safely ignore this email.</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} WanderLuxe. All rights reserved.</p>
          <p>WanderLuxe Travel Agency</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
