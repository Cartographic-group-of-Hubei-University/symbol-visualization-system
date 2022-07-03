var multer = require('multer');
var fs = require('fs');
var path = require('path');


let upload = multer({
    storage: multer.diskStorage({
        // 设置⽂件存储位置
        destination: function(req, file, cb) {
            let date = new Date()
            let year = date.getFullYear();
            let month = (date.getMonth() + 1).toString().padStart(2, '0')
            let day = date.getDate()
            let hours = date.getHours()
            let minutes = date.getMinutes()
            let second = date.getSeconds()
            day = day > 9 ? day : '0' + day
            hours = hours > 9 ? hours : '0' + hours
            minutes = minutes > 9 ? minutes : '0' + minutes
            second = second > 9 ? second : '0' + second
            let dir = path.join(__dirname, '../public/uploads/' + year + month + day + hours + minutes + second)

            // 判断⽬录是否存在，没有则创建
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            // dir就是上传⽂件存放的⽬录
            cb(null, dir)
        },
        // 设置⽂件名称
        filename: function(req, file, cb) {
            let date = new Date()
            let month = (date.getMonth() + 1).toString().padStart(2, '0')
            let day = date.getDate()
            day = day > 10 ? day : '0' + day
            let file_name = month + day
            let fileName = file_name + path.extname(file.originalname);
            // fileName就是上传⽂件的⽂件名
            cb(null, fileName)
        }
    })
});


// 递归删除文件夹
function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}



module.exports = { upload, delDir };
