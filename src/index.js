const yaml = require('js-yaml')
const request = require('request')
const fs = require('fs')
const { fcirclePlugin } = require('./plugins/index.js')
let friendFiles = []
const result = {}
const files = fs.readdirSync('./data')
const linkList = []
files.forEach(function (item, index) {
  // 压缩或者bese文件是没有相对应的页面的,这里做排除
  if (item.indexOf('.yml') !== -1) {
    friendFiles.push(item)
  }
})
const sortKey = process.env.sortKey || ''
/**
 * 排序
 */
sortKey.split(',').forEach((key) => {
  if (key) {
    result[key] = null
  }
})

if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist')
}

friendFiles.forEach((item) => {
  const name = item.split('.')
  const content = yaml.load(fs.readFileSync(`./data/${item}`, 'utf8'))
  linkList.push(...content.link_list)
  linkList.forEach((link)=>{
    //console.log("./dist/"+link['link'].replace("https://","").replace("/","")+".png");
    download_img("https://image.thum.io/get/width/400/crop/800/allowJPG/wait/20/noanimate/"+link['link'],"./dist/"+link['link'].replace("https://","").replace("/","")+".png")
  })
  content.link_list = content.link_list.filter((item) => {
    if (!item.disable) return item
  })
  if (content.link_list.length > 0) {
    result[name[0]] = content
  }
})


async function download_img(img_url, file_name){
  await request(img_url).pipe(fs.createWriteStream(file_name)).on('close',function(){
       console.log('正在下载 '+file_name)
   })
 }

const fcircleData = fcirclePlugin(linkList)
fs.writeFileSync('./dist/blogroll.json', JSON.stringify(result))
fs.writeFileSync('./dist/fcircle.json', JSON.stringify(fcircleData))
