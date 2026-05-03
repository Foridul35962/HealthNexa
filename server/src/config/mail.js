import axios from "axios";

export const sendBrevoMail = async (to, subject, html) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: "HealthNexa",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (error) {
    console.error(
      "Brevo Mail Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const generateVerificationMail = (otp) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Verify Your Health Nexa Account ✅',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Health Nexa</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; font-weight: 400;">Your Journey to Wellness Starts Here</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Verify Your Email</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              Thank you for joining Health Nexa! To complete your registration and secure your account, please use the verification code below:
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #f1f5f9; border: 2px solid #e2e8f0; color: #4f46e5; font-size: 36px; font-weight: 800; padding: 18px 45px; border-radius: 15px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                This code is valid for <strong>5 minutes</strong>.
              </p>
            </div>

            <div style="background-color: #fdf2f2; border-radius: 10px; padding: 15px; text-align: center;">
              <p style="color: #b91c1c; font-size: 13px; margin: 0;">
                For your security, never share this code with anyone.
              </p>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} Health Nexa Inc. All rights reserved. <br>
              If you did not create an account, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generatePasswordResetMail = (otp) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: 'Reset Your Password 🔐',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fffafb; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #fee2e2;">
          
          <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Health Nexa</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Security & Account Recovery</p>
          </div>

          <div style="padding: 40px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 15px; font-size: 22px; text-align: center;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We received a request to reset your Health Nexa password. Use the following One-Time Password (OTP) to proceed:
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #fff1f2; border: 2px solid #fecdd3; color: #e11d48; font-size: 36px; font-weight: 800; padding: 18px 45px; border-radius: 15px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                Expires in <strong>5 minutes</strong>.
              </p>
            </div>

            <div style="border-left: 4px solid #e11d48; background-color: #f8fafc; padding: 15px; border-radius: 0 8px 8px 0;">
              <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.5;">
                <strong>Didn't request this?</strong> If you didn't try to reset your password, your account is still safe, and you can safely ignore this email.
              </p>
            </div>
          </div>

          <div style="background: #fdfcfc; padding: 25px; text-align: center; border-top: 1px solid #fee2e2;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              &copy; ${currentYear} Health Nexa Security Team. <br>
              Protecting your health data with care.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateHospitalVerificationMail = (otp, hospitalName) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: `Verify Hospital Registration: ${hospitalName} | Health Nexa 🏥`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 45px 20px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
               <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Hospital Partnership</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">Health Nexa</h1>
          </div>

          <!-- Content Section -->
          <div style="padding: 45px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; text-align: center; font-weight: 700;">Action Required</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We received a request to add <strong>${hospitalName}</strong> to the Health Nexa network. To verify your authorization and proceed with the listing, please use the security code below:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin-bottom: 35px;">
              <div style="display: inline-block; background: #f8fafc; border: 2px dashed #cbd5e1; color: #2563eb; font-size: 40px; font-weight: 800; padding: 20px 40px; border-radius: 16px; letter-spacing: 10px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 15px;">
                This verification code will expire in <strong>10 minutes</strong>.
              </p>
            </div>

            <!-- Notice Box -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <p style="color: #1e40af; font-size: 13px; margin: 0; line-height: 1.5;">
                <strong>Note:</strong> Verification is mandatory to ensure that only authorized representatives can manage hospital profiles and patient records.
              </p>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
              &copy; ${currentYear} Health Nexa Inc. <br>
              Corporate Office: Healthcare Plaza, Tech City.<br>
              If you did not initiate this request, please <a href="#" style="color: #3b82f6; text-decoration: none;">report this immediately</a>.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generatePharmacyVerificationMail = (otp, pharmacyName) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: `Verify Pharmacy Registration: ${pharmacyName} | Health Nexa 💊`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Section (Green Gradient for Pharmacy/Pharma) -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 45px 20px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
               <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Pharmacy Partnership</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">Health Nexa</h1>
          </div>

          <!-- Content Section -->
          <div style="padding: 45px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 24px; text-align: center; font-weight: 700;">Verification Required</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
              We received a request to register <strong>${pharmacyName}</strong> to the Health Nexa platform. Please use the following OTP code to verify your pharmacy and complete the setup:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin-bottom: 35px;">
              <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #86efac; color: #059669; font-size: 40px; font-weight: 800; padding: 20px 40px; border-radius: 16px; letter-spacing: 10px;">
                ${otp}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 15px;">
                This code is valid for <strong>10 minutes</strong>.
              </p>
            </div>

            <!-- Notice Box -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <p style="color: #065f46; font-size: 13px; margin: 0; line-height: 1.5;">
                <strong>Security Note:</strong> This verification ensures that only legitimate pharmacy owners can manage inventory, digital prescriptions, and medicine orders.
              </p>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
              &copy; ${currentYear} Health Nexa Inc. <br>
              Healthcare Plaza, Tech City | Pharmacy Division<br>
              If this wasn't you, please <a href="#" style="color: #10b981; text-decoration: none;">report this immediately</a>.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generateHospitalRejectionMail = (hospitalName) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: `Update Regarding Your Registration Request: ${hospitalName} | Health Nexa`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #475569, #1e293b); padding: 45px 20px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
               <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Registration Status</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">Health Nexa</h1>
          </div>

          <!-- Content Section -->
          <div style="padding: 45px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 22px; text-align: center; font-weight: 700;">Application Update</h2>
            
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 25px;">
              Thank you for your interest in joining the Health Nexa network. After carefully reviewing the registration request for <strong>${hospitalName}</strong>, our administration team has decided not to approve the application at this time.
            </p>

            <!-- Rejection Notice -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.6;">
                As a result, your hospital has <strong>not been added</strong> to our official database. This decision may be due to incomplete documentation, verification failure, or eligibility criteria.
              </p>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 15px; text-align: center;">
              If you believe this was an error or would like to provide additional information for a future application, please feel free to reach out to our support desk.
            </p>
          </div>

          <!-- Footer Section -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
              &copy; ${currentYear} Health Nexa Inc. <br>
              Corporate Office: Healthcare Plaza, Tech City.<br>
              For further queries, please <a href="#" style="color: #3b82f6; text-decoration: none;">contact our support team</a>.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

export const generatePharmacyRejectionMail = (pharmacyName) => {
  const currentYear = new Date().getFullYear();
  return {
    subject: `Pharmacy Registration Update: ${pharmacyName} | Health Nexa`,
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 10px; min-height: 100%;">
        <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #64748b, #334155); padding: 45px 20px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
               <span style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Pharmacy Partnership</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">Health Nexa</h1>
          </div>

          <!-- Content Section -->
          <div style="padding: 45px 35px;">
            <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 22px; text-align: center; font-weight: 700;">Application Status</h2>
            
            <p style="color: #475569; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 25px;">
              Thank you for applying to join the Health Nexa pharmacy network. After reviewing the details provided for <strong>${pharmacyName}</strong>, our administrative team has decided not to move forward with your registration at this time.
            </p>

            <!-- Rejection Notice -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.6;">
                Consequently, your pharmacy has <strong>not been added</strong> to our official database. This may be due to verification requirements or internal policy guidelines.
              </p>
            </div>

            <p style="color: #475569; line-height: 1.6; font-size: 15px; text-align: center;">
              If you have any questions or would like to re-submit your application with updated documentation, please contact our administrative department.
            </p>
          </div>

          <!-- Footer Section -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.8;">
              &copy; ${currentYear} Health Nexa Inc. <br>
              Corporate Office: Healthcare Plaza, Tech City.<br>
              Technical Support: <a href="#" style="color: #3b82f6; text-decoration: none;">support@healthnexa.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  };
};