var express = require('express');
var router = express.Router();
var { upload, delDir } = require('../utils/index')
const compressing = require('compressing');
var fs = require('fs');


// 文件夹上传的路径
let upload_path = '';

// 添加符号的一些信息
let list = []


// 文件夹解压方法：先用数字命名，最后再用中文名进行替换

router.post('/upload', upload.single('file'), function(req, res, next) {
    // 文件的相关信息
    console.log(req.file);

    try {
        // 解压完成时，它会以原先传入时文件压缩的名称在uncompress()第二个参数后面的文件夹中创建一个文件夹，并将里面的数据进行解压
        compressing.zip.uncompress(req.file.path, req.file.destination)
            .then(() => {
                console.log('success');
                res.send({ code: 0, msg: '上传成功' })
                fs.readdir(req.file.destination, (err, files) => {
                    if (err) throw err

                    // 由于此时文件夹中存在一个文件夹和zip压缩文件，这里要进行筛选，此时我们只要文件夹的名称
                    var dir_name = files.filter((item) => {
                        return item.indexOf('.') === -1
                    });
                    // 获取加压完后文件夹的路径
                    upload_path = req.file.destination.replace(/\\/g, '/') + '/' + dir_name[0];
                })
            })
            .catch(err => {
                console.error(err);
            })
    } catch (e) {
        console.log(e);
        next(e)
    }
});


// 修改文件名称接口
router.post('/getFileName', function(req, res, next) {
    let { file_name } = req.body
    let fileName_arr = []
    try {
        // 读取文件夹
        fs.readdir(upload_path, (err, files) => {
            if (err) throw err

            // 不修改readme.xml这个文件的名称
            // 获取除readme.xml和zip压缩包这两个文件外其他所有文件的名称
            fileName_arr = files.filter(function(item) {
                return item !== 'readme.xml' && item.indexOf('.') !== -1
            });


            // 重命名该文件夹下所有的文件
            for (let i = 0; i < fileName_arr.length; i++) {
                fs.rename(upload_path + '/' + fileName_arr[i], upload_path + '/' + file_name + '.' + fileName_arr[i].split('.')[1], err => {
                    if (err) throw err;
                })
            }

            // 重命名文件夹(注意：修改文件夹名称的时候，必须要写相对路径，不能写绝对路径)
            // 获取需要重命名文件夹的相对路径
            let file_namelist = upload_path.split('/');
            let relative_name = './public/uploads/' + file_namelist[file_namelist.length - 2] + '/';

            setTimeout(() => {
                fs.rename(relative_name + file_namelist[file_namelist.length - 1], relative_name + file_name, (err) => {
                    if (err) throw err;
                });
            }, 100)
        })
        res.send({ code: 0, msg: '成功' });
    } catch (e) {
        console.log(e);
        next(e)
    }
});


// 获取我的符号列表接口
router.get('/getSymbolList', function(req, res, next) {
    let files_path = './public/uploads';
    // 符号详情列表
    let symbol_list = [];
    // 获取符号的名称
    let symbol_name = [];
    // 获取符号的路径
    let symbol_path = [];
    // 获取当前符号的描述信息
    let symbol_des = [];
    // 获取符号上传时间
    let symbol_time = [];
    try {
        fs.readdir(files_path, (err, files) => {
            if (err) throw err
            for (let i = 0; i < files.length; i++) {
                fs.readdir('./public/uploads' + '/' + files[i], (err, file) => {
                    if (err) throw err
                    var name_s = file.filter((item) => {
                        return item.indexOf('.') === -1
                    });
                    symbol_name.push(name_s[0]);
                    symbol_path.push('./server/public/uploads/' + files[i] + '/' + name_s[0]);
                    symbol_time.push(files[i]);
                    fs.readdir('./public/uploads/' + files[i] + '/' + name_s[0], (err, filetxt) => {
                        if (err) throw err
                        var des_s = filetxt.filter((item) => {
                            return item.indexOf('.txt') !== -1
                        });
                        fs.readFile('./public/uploads/' + files[i] + '/' + name_s[0] + '/' + des_s[0], 'utf8', (err, data) => {
                            if (err) throw err
                            symbol_path.forEach((item, index) => {
                                if (item.indexOf(files[i]) !== -1) {
                                    symbol_des[index] = data
                                }
                            })
                            if (i === files.length - 1) {
                                setTimeout(() => {
                                    for (let a = 0; a < symbol_name.length; a++) {
                                        var obj = {
                                            s_id: a + 1,
                                            s_name: symbol_name[a],
                                            s_time: symbol_time[a],
                                            s_des: symbol_des[a],
                                            s_path: symbol_path[a] + '/'
                                        }
                                        symbol_list.push(obj);
                                    }
                                    res.send({ code: 0, msg: '成功', data: symbol_list });
                                }, 200);
                            }
                        })
                    });
                })
            }
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
})


// 删除符号接口
router.post('/deleteSymbol', function(req, res, next) {
    let { delete_path } = req.body;
    let path = './public/uploads/' + delete_path
    try {
        // 调用删除文件的函数
        delDir(path)
        res.send({ code: 0, msg: '删除成功' });
    } catch (e) {
        console.log(e);
        next(e);
    }
})


module.exports = router;