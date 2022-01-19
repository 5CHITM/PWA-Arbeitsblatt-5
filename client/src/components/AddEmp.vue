<template>
  <div>
    <button @click="addEmployee">Add Emp</button>
  </div>
</template>

<script>
export default {
  name: 'AddEmp',
  data: () => ({
    first: 'Sebastian',
    last: 'Lang',
    phone: '123-456-789',
    email: 'test123@htl.at',
  }),
  methods: {
    addEmployee() {
      const newEmployee = { isDeleted: false };
      newEmployee['name'] = { title: 'Mr', first: `${this.first}`, last: `${this.last}` };
      newEmployee['phone'] = `${this.phone}`;
      newEmployee['email'] = `${this.email}`;
      console.log(newEmployee);
      return this.$emit('add', newEmployee);
    },
  },
};
</script>

<style scoped>
img {
  width: 10rem;
}
</style>
