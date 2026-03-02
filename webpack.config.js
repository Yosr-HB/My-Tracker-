const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
 entry: "./src/index.js",
 output: {
   path: path.resolve(__dirname, "dist"),
   filename: "bundle.js",
 },
 module: {
   rules: [
     {
       test: /\.(js|jsx)$/,
       exclude: /node_modules/,
       use: "babel-loader",
     },
     {
       test: /\.css$/,
       use: ["style-loader", "css-loader"],
     },
   ],
 },
 plugins: [
   new HtmlWebpackPlugin({
     template: "./src/index.html",
   }),
 ],
 devServer: {
   static: "./dist",
   port: 3000,
   historyApiFallback: true,
   proxy: [
     {
       context: ["/api"],
       target: "http://localhost:5000",
       changeOrigin: true,
       secure: false,
     },
   ],
 },
 resolve: {
   extensions: [".js", ".jsx"],
 },
};