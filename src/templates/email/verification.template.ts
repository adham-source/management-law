export const verificationEmailTemplate = (verificationLink: string, name: string): string => {
  const currentYear = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>تأكيد حسابك - نظام إدارة مكاتب المحاماة</title>
    <style>
      /* ========== الأساسيات ========== */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f3f6fa;
        color: #2d3748;
        direction: rtl;
        padding: 20px;
      }

      .container {
        max-width: 640px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e6ed;
      }

      /* ========== رأس البريد ========== */
      .header {
        background: linear-gradient(135deg, #004aad, #0070f3);
        color: #ffffff;
        text-align: center;
        padding: 50px 25px 40px;
        position: relative;
      }

      .logo {
        font-size: 60px;
        margin-bottom: 15px;
      }

      .header h1 {
        font-size: 28px;
        margin-bottom: 8px;
        font-weight: 700;
      }

      .header p {
        font-size: 15px;
        opacity: 0.9;
      }

      /* ========== المحتوى ========== */
      .content {
        padding: 45px 35px 35px;
        text-align: right;
      }

      .greeting {
        font-size: 22px;
        font-weight: 700;
        color: #1a202c;
        margin-bottom: 18px;
      }

      .message {
        font-size: 16px;
        color: #4a5568;
        line-height: 1.7;
        margin-bottom: 25px;
      }

      .highlight {
        background: #f0f7ff;
        border-right: 4px solid #004aad;
        padding: 18px 20px;
        border-radius: 10px;
        margin-bottom: 30px;
      }

      .button-container {
        text-align: center;
        margin: 40px 0;
      }

      .button {
        background: linear-gradient(135deg, #004aad, #0070f3);
        color: #fff;
        padding: 15px 40px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        font-size: 17px;
        display: inline-block;
        transition: 0.3s;
        box-shadow: 0 5px 20px rgba(0, 106, 255, 0.3);
      }

      .button:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, #003c8f, #005fcb);
      }

      .link-container {
        background: #f9fbfd;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 18px;
        text-align: center;
        font-size: 14px;
      }

      .verification-link {
        color: #004aad;
        text-decoration: none;
        word-break: break-all;
        display: inline-block;
        margin-top: 8px;
        font-weight: 600;
        direction: ltr;
      }

      /* ========== خطوات التفعيل ========== */
      .steps {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 16px;
        margin: 40px 0;
      }

      .step {
        flex: 1;
        min-width: 150px;
        background: #f8fafc;
        border-radius: 10px;
        text-align: center;
        padding: 20px 10px;
      }

      .step-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        margin: 0 auto 12px;
        background: linear-gradient(135deg, #004aad, #0070f3);
        color: #fff;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .step-title {
        font-weight: 700;
        font-size: 15px;
        color: #1a202c;
        margin-bottom: 5px;
      }

      .step-description {
        font-size: 13px;
        color: #718096;
      }

      /* ========== تذييل البريد ========== */
      .footer {
        background: #0d1b2a;
        color: #cbd5e0;
        text-align: center;
        padding: 40px 25px 30px;
      }

      .social-links {
        display: flex;
        justify-content: center;
        gap: 14px;
        margin-bottom: 20px;
      }

      .social-link {
        width: 42px;
        height: 42px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e2e8f0;
        text-decoration: none;
        font-size: 18px;
        transition: all 0.3s;
      }

      .social-link:hover {
        background: #004aad;
        color: #fff;
        transform: scale(1.1);
      }

      .footer-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        margin-bottom: 15px;
      }

      .footer-link {
        color: #cbd5e0;
        font-size: 14px;
        text-decoration: none;
        transition: color 0.3s;
      }

      .footer-link:hover {
        color: #fff;
      }

      .copyright {
        font-size: 13px;
        color: #a0aec0;
        line-height: 1.6;
      }

      @media (max-width: 600px) {
        .steps {
          flex-direction: column;
          gap: 12px;
        }

        .button {
          width: 100%;
          padding: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">⚖️</div>
        <h1>نظام إدارة مكاتب المحاماة</h1>
        <p>منصة احترافية لإدارة القضايا والمواعيد والفِرق القانونية</p>
      </div>

      <!-- Content -->
      <div class="content">
        <h2 class="greeting">مرحباً ${name} 👋</h2>

        <p class="message">
          شكراً لانضمامك إلى <strong>نظام إدارة مكاتب المحاماة</strong>! لتفعيل حسابك والوصول إلى جميع الميزات،
          يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه:
        </p>

        <div class="button-container">
          <a href="${verificationLink}" class="button">تفعيل الحساب الآن</a>
        </div>

        <div class="link-container">
          في حال لم يعمل الزر، يمكنك نسخ الرابط أدناه:
          <br />
          <a href="${verificationLink}" class="verification-link">${verificationLink}</a>
        </div>

        <div class="highlight">
          <strong>فوائد تفعيل الحساب:</strong>
          <ul style="margin: 10px 20px 0 0; color: #2d3748;">
            <li>🔹 الوصول إلى لوحة التحكم الكاملة</li>
            <li>🔹 إدارة القضايا والمهام بسهولة</li>
            <li>🔹 التعاون مع فريقك في الوقت الفعلي</li>
          </ul>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step-icon">✅</div>
            <div class="step-title">تأكيد البريد</div>
            <div class="step-description">انقر على رابط التفعيل المرسل إليك</div>
          </div>
          <div class="step">
            <div class="step-icon">🧾</div>
            <div class="step-title">إكمال البيانات</div>
            <div class="step-description">قم بإضافة تفاصيل مكتبك ومعلوماتك</div>
          </div>
          <div class="step">
            <div class="step-icon">🚀</div>
            <div class="step-title">ابدأ الآن</div>
            <div class="step-description">استخدم النظام لتطوير عملك القانوني</div>
          </div>
        </div>

        <p class="message" style="text-align:center; font-size:14px; color:#718096;">
          إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذه الرسالة بأمان.
        </p>

        <p class="message" style="text-align:center; margin-top:30px;">
          مع خالص التحية،<br />
          <strong style="color:#004aad;">فريق الدعم الفني</strong><br />
          <span style="font-size:13px; color:#718096;">نظام إدارة مكاتب المحاماة</span>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="social-links">
          <a href="#" class="social-link">📧</a>
          <a href="#" class="social-link">💼</a>
          <a href="#" class="social-link">📱</a>
          <a href="#" class="social-link">🌐</a>
        </div>

        <div class="footer-links">
          <a href="#" class="footer-link">الأسئلة الشائعة</a>
          <a href="#" class="footer-link">الدعم الفني</a>
          <a href="#" class="footer-link">سياسة الخصوصية</a>
          <a href="#" class="footer-link">الشروط والأحكام</a>
        </div>

        <div class="copyright">
          <p>© ${currentYear} جميع الحقوق محفوظة لنظام إدارة مكاتب المحاماة.</p>
          <p>هذه رسالة آلية — لا ترد عليها. للتواصل مع الدعم، زر مركز المساعدة.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};
