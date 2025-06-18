export const generateResetPasswordEmail = ({ token }: { token: string }) => {
    const link = `${process.env.CORS}/auth/reset-password?token=${token}`;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Password Reset</title>
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
          padding: 12px 24px;
          background-color: #2A7A7B;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        }
        .footer {
          background-color: #2A7A7B;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #FFFFFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <div class="logo">WanderLuxe</div>
          
          <h2>Reset Your Password</h2>
          
          <p>We received a request to reset your WanderLuxe account password. If you didn’t make this request, you can ignore this email.</p>
          
          <p>Otherwise, click the button below to reset your password. This link will expire in 1 hour.</p>
          
          <p style="text-align: center;">
          <a href="${link}" 
               style="
                 display: inline-block;
                 padding: 12px 24px;
                 background-color: #2A7A7B;
                 color: #ffffff !important;
                 text-decoration: none;
                 border-radius: 6px;
                 font-weight: bold;
                 text-align: center;
                 font-family: 'Poppins', Arial, sans-serif;
               ">
               Reset Password
            </a>
          </p>
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
