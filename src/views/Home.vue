<template>
  <div class="home-container">
    <header class="header">
      <h1>Carefinder</h1>
      <p>
        Access to healthcare in Nigeria can be challenging. Carefinder is a tool designed to help users find, export, and share hospitals within their region, ensuring that everyone has access to essential healthcare information.
      </p>
    </header>

    <section class="features">
      <div class="feature clickable" @click="goToSearch" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>Hospital Search</h2>
        <p>
          Easily search for hospitals in your area. Input your location or select from nearby cities to get a list of hospitals with their contact details, including address, phone number, and email.
        </p>
      </div>
      <div class="feature" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>Map</h2>
        <p>
          A map to guide you.
        </p>
      </div>
      <div class="feature" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>Export Hospitals</h2>
        <p>
          Export the list of hospitals to a CSV file for easy saving and sharing.
        </p>
      </div>
      <div class="feature" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>Share Hospitals</h2>
        <p>
          Share the list of hospitals via email or by generating a shareable link.
        </p>
      </div>
      <div class="feature" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>User Authentication</h2>
        <p>
          Admin users can create an account to access platform admin features.
        </p>
      </div>
      <div class="feature" @touchstart="handleTouchStart($event)" @touchend="handleTouchEnd($event)">
        <h2>Markdown Support</h2>
        <p>
          Admin users can create and format hospital entries using markdown, with support for links and images.
        </p>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "Home",
  methods: {
    goToSearch() {
      this.$router.push({ name: 'HospitalSearch' });
    },
    handleTouchStart(event: TouchEvent) {
      const target = event.currentTarget as HTMLElement | null;
      if (target) {
        target.classList.add('hover-effect');
      }
    },
    handleTouchEnd(event: TouchEvent) {
      const target = event.currentTarget as HTMLElement | null;
      if (target) {
        setTimeout(() => {
          target.classList.remove('hover-effect');
        }, 300); // Remove the class after a short delay
      }
    },
  },
});
</script>


<style scoped>
:root {
  --color-primary: #4CAF50;
  --color-primary-hover: #45a049;
  --color-text-light: #333;
  --color-text-dark: #ccc;
  --color-background-light: #f5f5f5;
  --color-background-dark: #2c2c2c;
  --color-feature-background-light: #fff;
  --color-feature-background-dark: #3c3c3c;
  --color-shadow: rgba(0, 0, 0, 0.1);
  --color-shadow-dark: rgba(0, 0, 0, 0.5);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text-light: #ccc;
    --color-background-light: #2c2c2c;
    --color-feature-background-light: #3c3c3c;
    --color-shadow: rgba(0, 0, 0, 0.5);
  }
}

.home-container {
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  min-height: 100vh;
  background-color: var(--color-background-light);
  color: var(--color-text-light);
  transition: background-color 0.3s, color 0.3s;
}

.header {
  margin-bottom: 40px;
  padding: 20px;
}

.header h1 {
  font-size: 2.5em;
  color: var(--color-text-light);
  margin-bottom: 20px;
}

.header p {
  font-size: 1.2em;
  color: var(--color-text-light);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
}

.feature {
  background-color: var(--color-feature-background-light);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--color-shadow);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
}

.feature.clickable {
  cursor: pointer;
}

.feature:hover,
.feature.hover-effect {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px var(--color-shadow-dark);
}

.feature h2 {
  font-size: 1.5em;
  color: var(--color-text-light);
  margin-bottom: 10px;
}

.feature p {
  font-size: 1em;
  color: var(--color-text-light);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
    margin: 0;
  }

  .header h1 {
    font-size: 2em;
  }

  .header p {
    font-size: 1.1em;
    margin: 0 10px;
  }
}
</style>
