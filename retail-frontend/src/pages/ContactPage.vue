<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const email = ref("");
const message = ref("");

const successMessage = ref("");
const sending = ref(false);

const sendMessage = async () => {

    sending.value = true;
    successMessage.value = "";

  try {

    const res = await fetch("http://localhost:3000/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value
      })
    });

    const data = await res.json();

     if (data.success) {

      successMessage.value = "✅ Your message has been sent! We'll reply soon.";

      name.value = "";
      email.value = "";
      message.value = "";

    } else {
      successMessage.value = "❌ Failed to send message.";
    }

  } catch (err) {
    successMessage.value = "❌ Server error. Please try again.";
  }

  sending.value = false;
};
</script>

<template>
  <div class="contact-page">

    <h1>Contact Us</h1>

    <p class="subtitle">
      Have a question? Send us a message and we'll get back to you.
    </p>

    <form class="contact-form" @submit.prevent="sendMessage">

      <label>
        Name
        <input v-model="name" type="text" placeholder="Your name" />
      </label>

      <label>
        Email
        <input v-model="email" type="email" placeholder="Your email address" />
      </label>

      <label>
        Message
        <textarea v-model="message" placeholder="Your message"></textarea>
      </label>

      <button type="submit" :disabled="sending">
        {{ sending ? "Sending..." : "Send Message" }}
      </button>

    </form>

    <div v-if="successMessage" class="message-box">
  {{ successMessage }}
</div>

  </div>
</template>

<style scoped>

.contact-page{
  max-width:700px;
  margin:3rem auto;
  padding:0 2rem;
  text-align:center;
}

.subtitle{
  color:#666;
  margin-bottom:2rem;
}

.contact-form{
  display:flex;
  flex-direction:column;
  gap:1.2rem;
}

label{
  display:flex;
  flex-direction:column;
  text-align:left;
  font-weight:500;
}

input,
textarea{
  margin-top:6px;
  padding:0.7rem;
  border-radius:6px;
  border:1px solid #ccc;
  font-size:1rem;
}

textarea{
  min-height:120px;
  resize:vertical;
}

button{
  margin-top:1rem;
  padding:0.9rem;
  border:none;
  background:purple;
  color:white;
  font-size:1rem;
  cursor:pointer;
  border-radius:6px;
}

button:hover{
  opacity: 0.85;
}

.message-box{
  margin-top:20px;
  padding:18px 20px;
  border-radius:10px;

  background: rgba(0, 180, 0, 0.15);
  border:2px solid rgba(0, 160, 0, 0.5);

  color:#065f06;
  font-weight:600;
  text-align:center;
  font-size:1.05rem;
}

</style>