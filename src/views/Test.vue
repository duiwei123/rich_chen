<template>
    <el-button type="primary" @click="testSSE">Query</el-button>
</template>

<script>
import http from '../utils/http';
export default {
    data() {
        message: ''
    },
    methods: {
        testSSE() {
            http.get('/testSSE')
        }
    }
}

</script>