<template>
  <div class="home-container">
    <header class="header">
      <h1>Carefinder</h1>
      <p>
        Access to healthcare in Nigeria can be challenging. Carefinder is a tool designed to help users find, export, and share hospitals within their region, ensuring that everyone has access to essential healthcare information.
      </p>
    </header>

    <section class="features">
      <div class="feature">
        <h2>Hospital Search</h2>
        <p>
          Easily search for hospitals in your area. Input your location or select from nearby cities to get a list of hospitals with their contact details, including address, phone number, and email.
        </p>
      </div>
      <div class="feature">
        <h2>Map</h2>
        <p>
          A Map to guide you
        </p>
      </div>

      <div class="feature">
        <h2>Export Hospitals</h2>
        <p>
          Export the list of hospitals to a CSV file for easy saving and sharing.
        </p>
      </div>
      <div class="feature">
        <h2>Share Hospitals</h2>
        <p>
          Share the list of hospitals via email or by generating a shareable link.
        </p>
      </div>
      <div class="feature">
        <h2>User Authentication</h2>
        <p>
          Admin users can create an account to access platform admin features.
        </p>
      </div>
      <div class="feature">
        <h2>Markdown Support</h2>
        <p>
          Admin users can create and format hospital entries using markdown, with support for links and images.
        </p>
      </div>
    </section>

    <footer class="footer">
      <button class="search-button" @click="goToSearch">Search Hospitals</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    goToSearch() {
      this.$router.push({ name: 'HospitalSearch' });
    },
  },
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  text-align: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5em;
  color: #333;
}

.header p {
  font-size: 1.2em;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.feature {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.feature h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.feature p {
  font-size: 1em;
  color: #666;
}

.footer {
  margin-top: 40px;
}

.search-button {
  padding: 15px 30px;
  font-size: 1.2em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
