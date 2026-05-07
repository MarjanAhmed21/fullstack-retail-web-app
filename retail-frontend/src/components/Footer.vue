<template>
  <footer class="footer">
    <div class="footer-container">

      <div class="footer-section">
        <h4>Customer Care</h4>
        <p>Delivery & Returns</p>
        <p>Click & Collect</p>
        <p>Help & Contact Us</p>
        <p>Track My Order</p>
      </div>

      <div class="footer-section">
        <h4>Corporate</h4>
        <p>Careers at Marjan Threads</p>
        <p>Sustainability</p>
      </div>

      <div class="footer-section">
        <h4>Legal</h4>
        <p>Terms & Conditions</p>
        <p>Privacy & Cookies</p>
        <p>Accessibility</p>
        <p>Cookie Settings</p>
        <p>Site Map</p>
        <p>Modern Slavery Report</p>
      </div>

      <div class="footer-section">
        <h4>Follow Us</h4>
        <p>Instagram</p>
        <p>Facebook</p>
        <p>Twitter</p>
        <p>TikTok</p>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #111;
  color: white;
  padding: 2rem;
  margin-top: 4rem;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
}

.footer-section h4 {
  margin-bottom: 0.8rem;
}

.footer-section p {
  margin: 0.3rem 0;
  cursor: pointer;
  opacity: 0.8;
}

.footer-section p:hover {
  opacity: 1;
}
</style>