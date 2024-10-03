import React, { useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    // Restore the scroll position when the user navigates back
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }
  }, []);

  const handleAccept = () => {
    console.log("Terms accepted");
    navigate('/signup');  // Navigate back to the Sign Up page
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center">Terms and Conditions</h2>
      <p>Welcome to our application! Please carefully review the following Terms and Conditions, which govern your access to and use of the services provided by our platform. By accessing or using the services, you agree to be bound by these terms.</p>
      
      <h3>1. Introduction</h3>
      <p>These Terms and Conditions ("Terms") apply to the use of our web application, mobile services, APIs, and all related services (collectively, the "Services"). By accessing or using the Services, you agree to these Terms. If you do not agree with any part of the Terms, please discontinue the use of our Services immediately.</p>

      <h3>2. User Accounts and Responsibilities</h3>
      <p>To access certain features of our application, you are required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary. You are responsible for safeguarding your account information, including your password, and for any activities that occur under your account. If you suspect any unauthorized access to your account, you must notify us immediately.</p>

      <h3>3. Privacy and Data Protection</h3>
      <p>We are committed to protecting your privacy. Our <a href="/privacy-policy">Privacy Policy</a> outlines how we collect, use, and protect your personal information. By using our Services, you consent to the collection and use of your data in accordance with our Privacy Policy. We implement appropriate technical and organizational measures to protect your personal information from unauthorized access or disclosure.</p>

      <h3>4. Intellectual Property</h3>
      <p>All content, features, and functionality of the Services, including but not limited to software, text, graphics, logos, images, and trademarks, are owned by us or our licensors and are protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Services for personal, non-commercial purposes. Any unauthorized use of the Services or any of its content is strictly prohibited.</p>

      <h3>5. Prohibited Activities</h3>
      <p>While using our Services, you agree not to:</p>
      <ul>
        <li>Engage in any activity that violates any applicable law or regulation.</li>
        <li>Use the Services to distribute malware, viruses, or other harmful software.</li>
        <li>Attempt to hack, disrupt, or disable the Services or our systems.</li>
        <li>Misrepresent your identity or affiliation with any entity.</li>
        <li>Engage in data scraping, mining, or any other unauthorized data collection activities.</li>
      </ul>

      <h3>6. Service Availability</h3>
      <p>We strive to maintain the availability of our Services at all times. However, we do not guarantee uninterrupted access, and the Services may be temporarily unavailable due to maintenance, upgrades, or technical issues beyond our control. We reserve the right to modify, suspend, or discontinue any part of the Services at any time without notice.</p>

      <h3>7. Limitation of Liability</h3>
      <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Services. Our total liability to you for any claims arising under these Terms shall not exceed the amount you have paid to us, if any, for access to the Services.</p>

      <h3>8. Termination of Accounts</h3>
      <p>We reserve the right to terminate or suspend your account at any time if we believe that you have violated these Terms or engaged in any unlawful activity. Upon termination, you will no longer have access to your account or any data associated with it. Termination does not affect any rights or obligations accrued prior to the termination date.</p>

      <h3>9. Changes to These Terms</h3>
      <p>We may modify these Terms from time to time to reflect changes in our Services or legal requirements. We will provide notice of any material changes to the Terms by posting an updated version on our website or through other communication channels. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>

      <h3>10. Governing Law and Dispute Resolution</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law principles. Any disputes arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of [Arbitration Body], and judgment on the arbitration award may be entered in any court having jurisdiction.</p>

      <h3>11. Contact Information</h3>
      <p>If you have any questions or concerns regarding these Terms or our Services, please contact us at [email/contact information].</p>

      <p>By using our application, you confirm that you have read, understood, and agree to these Terms and Conditions.</p>

      <div className="text-center mt-4">
        <Button variant="primary" onClick={handleAccept}>
          Accept Terms
        </Button>
      </div>
    </Container>
  );
}

export default TermsAndConditions;
