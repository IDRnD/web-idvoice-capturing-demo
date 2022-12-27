<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg"
      class="progress-ring"
      height="120"
      width="120"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="startColor" />
          <stop offset="100%" :stop-color="endColor" />
        </linearGradient>
      </defs>
      <circle
        class="progress-ring-circle"
        stroke="url(#gradient)"
        stroke-width="12"
        fill="transparent"
        stroke-linecap="round"
        r="36"
        cx="60"
        cy="60"
      />
    </svg>
  </div>
</template>

<script>
  export default {
    name: "Progress",
    props: {
      percent: Number,
      ranges: Array
    },
    data() {
      return {
        circle: null,
        circumference: null
      }
    },
    computed: {
      startColor: function() {
        if (this.percent <= this.ranges[0]) return '#cc242f';
        if (this.percent <= this.ranges[1]) return '#cebf1c';
        if (this.percent > this.ranges[1]) return '#2c8e6a';
        return '#00000000';
      },
      endColor: function() {
        if (this.percent <= this.ranges[0]) return '#ef2b38';
        if (this.percent <= this.ranges[1]) return '#eada2e';
        if (this.percent > this.ranges[1]) return '#38b587';
        return '#00000000';
      }
    },
    mounted() {
      this.circle = document.querySelector('.progress-ring-circle');
      let radius = this.circle.r.baseVal.value;
      this.circumference = radius * 2 * Math.PI;
      this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      this.circle.style.strokeDashoffset = `${this.circumference}`;
    },
    watch: {
      percent: function (val) {
        this.setProgress(val);
      }
    },
    methods: {
      setProgress(percent) {
        const offset = this.circumference - percent / 100 * this.circumference;
        this.circle.style.strokeDashoffset = offset;
      }
    }
  }
</script>

<style scoped>
  .progress-ring-circle {
    transition: stroke-dashoffset 0.35s;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
</style>
