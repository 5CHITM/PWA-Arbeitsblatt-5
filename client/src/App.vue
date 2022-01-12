<template>
  <div id="app" class="container d-flex flex-column justify-content-center align-items-center mt-5">
    <img :src="`${serverAddress}/employees.jpg`" class="mx-auto d-block my-3" width="300" alt="picture of employees" />
    <div class="alert alert-danger" role="alert" v-if="offline">Du bist offline...</div>
    <h1>Hey</h1>
    <ButtonGet @get="fetchData"></ButtonGet>
    <CardView :employees="employees" :offline="offline" @del="delEmployee"></CardView>
    <!-- <button class="btn btn-primary" @click="subscribe">Subscribe</button> -->
  </div>
</template>

<script>
import { openDB } from 'idb';
import axios from 'axios';

import ButtonGet from '@/components/ButtonGet.vue';
import CardView from '@/components/CardView.vue';

export default {
  name: 'app',
  components: {
    ButtonGet,
    CardView,
  },
  data() {
    return {
      serverAddress: process.env.VUE_APP_SERVER,
      employees: [],
      offline: null,
      db: null,
    };
  },
  created() {
    window.addEventListener('online', () => (this.offline = false));
    window.addEventListener('offline', () => (this.offline = true));
    document.addEventListener('swUpdated', this.updateAvailable, { once: true });

    if (!window.indexedDB) return alert('IndexedDB is not available!');
    if (!this.db) this.openDB();
  },
  methods: {
    async openDB() {
      this.db = await openDB('employeesDB1', 1, {
        upgrade(db) {
          db.createObjectStore('employees', { keyPath: 'id' });
        },
      });
    },

    async getDataOff() {
      const employees = await this.db.getAll('employees');
      this.employees = employees.filter((el) => !el.isDeleted);
    },

    fetchData() {
      console.log('fetchData called');
      if (this.offline) this.getDataOff();
      else this.getDataOn();
    },

    async getDataOn() {
      try {
        let { data } = await axios.get(`${this.serverAddress}/employees`);
        this.employees = data.map((el) => ({ ...el, isDeleted: false }));

        const tx = this.db.transaction('employees', 'readwrite');
        tx.objectStore('employees').clear();
        await tx.done;

        for (let employee of this.employees) {
          await this.db.put('employees', employee);
        }
      } catch (error) {
        console.error(error);
      }
    },

    delEmployee(e) {
      console.log('delEmployee called');
      if (this.offline) this.delEmployeeOff(e);
      else this.delEmployeeOn(e);
      this.fetchData();
    },

    async delEmployeeOff(e) {
      let employee = await this.db.get('employees', Number(e.id));
      employee.isDeleted = true;
      this.db.put('employees', employee);
    },

    async delEmployeeOn(e) {
      try {
        await axios({
          url: `${process.env.VUE_APP_SERVER}/employee/${e.id}`,
          method: 'delete',
        });
      } catch (error) {
        console.error(error);
      }
    },

    updateAvailable() {
      if (confirm(`New content is available!. Click OK to refresh`)) {
        window.location.reload();
      }
    },

    async subscribe() {
      if (!('serviceWorker' in navigator)) {
        console.log('no service worker!');
        return;
      }
      const publicVapidKey = 'BC6ShlsYI5aJYDRCGxIAWzKGaoZeEA3Oy4Mj7K5Z-ycuSkVEPvf3Q4PShKGswo8s4vwt9JCvxXA63sb6MRC9foA';
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey),
      });
      await axios.post('/subscribe', subscription);
    },

    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  },
};
</script>

<style></style>
