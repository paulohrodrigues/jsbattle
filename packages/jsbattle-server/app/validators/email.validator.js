module.exports = (config) => ({
  type: "string",
  min: 3,
  max: 256,
  pattern: /^[\w-]+@([\w-]+\.)+[\w-]+$/,
  ...config
})