interface ContactMessageParams {
    full_name: string;
    email: string;
    phone_number: string;
    message: string;
}

export const generateContactMessageEmail = ({
                                                full_name,
                                                email,
                                                phone_number,
                                                message,
                                            }: ContactMessageParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>New Contact Message</title>
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
        .footer {
          background-color: #2A7A7B;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #FFFFFF;
        }
        .message-box {
          background: #fff;
          border: 1px solid #CBD5E0;
          padding: 20px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
        </div>
        
        <div class="content">
          <div class="logo">WanderLuxe</div>
          
          <h2>You've received a new message!</h2>
          
          <div class="message-box">
            <p><strong>Full Name:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${phone_number}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
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
