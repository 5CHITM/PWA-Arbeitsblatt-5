<template>
  <div id="app" class="container">
    <h2>indexedDB Testsite</h2>
    <div class="d-flex">
      <div class="w-50">
        <h4>My Friends</h4>
        <ul class="list-group mb-4">
          <li v-for="(friend, i) of friends" :key="i" class="list-group-item list-group-item-primary d-flex my-1">
            <span>{{ friend.name.first }} {{ friend.name.last }}</span>
            <span class="flex-grow-1"></span>
            <span @click="addFriend(friend)" class="btn-span"><i class="fas fa-plus-square"></i></span>
          </li>
        </ul>
        <button class="btn btn-primary" @click="addAllFriends()">Store all</button>
      </div>
      <div class="w-50 ms-5">
        <h4>My Friends in the Database</h4>
        <table class="table">
          <thead>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Action</th>
          </thead>
          <tbody>
            <tr v-for="friend of storedFriends" :key="friend.id">
              <td>{{ friend.id }}</td>
              <td>{{ friend.name.first }}</td>
              <td>{{ friend.name.last }}</td>
              <td>{{ friend.age }}</td>
              <td>
                <span class="btn-span ms-3" @click="removeFriend(friend.id)"><i class="fas fa-trash-alt"></i></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="mt-5 row align-items-center">
      <div class="col-1">
        <span class="align-middle">Search id:</span>
      </div>
      <div class="col-1">
        <input @focus="searchResult = false" v-model="id" class="form-control" type="text" />
      </div>
      <div class="col-1">
        <button class="ms-3 btn btn-primary" @click="findFriend()">Find!</button>
      </div>
      <div class="col-3">
        <div v-if="searchResult && friend != null">
          <span class="fw-bold"> Found: {{ friend.name.first }} {{ friend.name.last }}, {{ friend.age }} </span>
        </div>
        <span v-else-if="searchResult" class="fw-bold text-danger">Not found</span>
      </div>
    </div>
    <div class="mt-3 row align-items-center">
      <div class="col-1">
        <span>Old Name:</span>
      </div>
      <div class="col-2">
        <input v-model="oldName" class="form-control" type="text" />
      </div>
      <div class="col-1">
        <span>New Name:</span>
      </div>
      <div class="col-2">
        <input v-model="newName" class="form-control" type="text" />
      </div>
      <div class="col-1">
        <button class="btn btn-primary" @click="updateFriend()">Change!</button>
      </div>
    </div>
    <div class="mt-3 row align-items-center">
      <div class="col-1">
        <span>From Age:</span>
      </div>
      <div class="col-2">
        <input v-model="fromAge" class="form-control" type="number" />
      </div>
      <div class="col-1">
        <span>To Age:</span>
      </div>
      <div class="col-2">
        <input v-model="toAge" class="form-control" type="number" />
      </div>
      <div class="col-1">
        <button class="btn btn-primary" @click="getFriendsWithAge()">Filter!</button>
      </div>
      <div class="col-3" v-if="filterResult[0]">
        <ul>
          <li v-for="friend of filterResult" :key="friend.name.lastname">Found: {{ friend.name.first }} {{ friend.name.last }} {{ friend.age }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { openDB } from 'idb';
export default {
  name: 'App',
  data() {
    return {
      friends: [
        {
          id: 1,
          age: 47,
          name: {
            first: 'Sarah',
            last: 'Bridges',
          },
        },
        {
          id: 2,
          age: 26,
          name: {
            first: 'Madge',
            last: 'Shaw',
          },
        },
        {
          id: 3,
          age: 51,
          name: {
            first: 'Jim',
            last: 'McGee',
          },
        },
        {
          id: 4,
          age: 35,
          name: {
            first: 'Randy',
            last: 'Shields',
          },
        },
        {
          id: 5,
          age: 45,
          name: {
            first: 'Luann',
            last: 'Curtis',
          },
        },
      ],
      db: null,
      id: '',
      searchResult: false,
      friend: null,
      storedFriends: [],
      oldName: 'Bridges',
      newName: 'Cerny',
      fromAge: '',
      toAge: '',
      filterResult: [],
    };
  },
  created() {
    if (!window.indexedDB) return alert('IndexedDB is not available!');
    if (!this.db) this.openDB();
  },
  methods: {
    async openDB() {
      this.db = await openDB('friendsDB1', 1, {
        upgrade(db) {
          const objectStore = db.createObjectStore('friends', { keyPath: 'id' });
          objectStore.createIndex('lastname', 'name.last', { unique: true });
          objectStore.createIndex('age', 'age', { unique: false });
        },
      });
      this.getStoredFriends();
    },
    async addFriend(friend) {
      // const tx = this.db.transaction('friends', 'readwrite'); // erstelle Transaktion im R/W Mode
      // const store = tx.objectStore('friends'); // hole Zugriff auf den Store
      // await store.put(friend); // put = neu oder update, je nach dem
      // await tx.done; // warte auf Ende der Transaktion
      await this.db.put('friends', friend);
      this.getStoredFriends();
    },
    async addAllFriends() {
      for (const friend of this.friends) {
        this.addFriend(friend);
      }
    },
    async removeFriend(id) {
      await this.db.delete('friends', id);
      this.getStoredFriends();
    },

    async findFriend() {
      const res = await this.db.get('friends', Number(this.id));
      if (res) {
        this.searchResult = true;
        this.friend = res;
      }
    },

    async updateFriend() {
      const tx = this.db.transaction('friends', 'readwrite');
      const index = tx.store.index('lastname');
      const obj = await index.get(this.oldName);
      obj.name.last = this.newName;
      await this.db.put('friends', obj);
      await tx.done;

      this.getStoredFriends();
    },

    async getFriendsWithAge() {
      this.filterResult = await this.db.getAllFromIndex('friends', 'age', IDBKeyRange.bound(Number(this.fromAge), Number(this.toAge)));
    },

    async getStoredFriends() {
      this.storedFriends = await this.db.getAll('friends');
    },
  },
};
</script>

<style>
.btn-span {
  cursor: pointer;
}
</style>
