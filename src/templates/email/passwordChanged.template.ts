export const passwordChangedTemplate = (userName: string, initiatorName: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تغيير كلمة المرور</title>
    <style>
      body {
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: right;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #0044cc;
        color: #ffffff;
        padding: 10px;
        text-align: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      .content {
        padding: 20px;
        line-height: 1.6;
        color: #333333;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>نظام إدارة المحاماة</h1>
      </div>
      <div class="content">
        <h2>إشعار تغيير كلمة المرور</h2>
        <p>مرحباً ${userName}،</p>
        <p>نود إعلامك بأنه تم تغيير كلمة المرور الخاصة بحسابك.</p>
        <p>تم هذا التغيير بواسطة: <strong>${initiatorName}</strong>.</p>
        <p>إذا لم تقم بهذا التغيير، أو إذا كنت تعتقد أن حسابك قد تم اختراقه، يرجى الاتصال بفريق الدعم لدينا على الفور.</p>
        <p>شكرًا لك،<br>فريق دعم نظام إدارة المحاماة</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
