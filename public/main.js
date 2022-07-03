var models = [];
var treedata = [];
var modelsQueryResult = [];
var modelsQueryTree = [];
var binUrl;
var xmldoc;
var xmldata;
var sxmldata;
var xmlobj;
var myScenes;
var modelData;
var fileName;
var binData;

// 符号维度查询
var dimension_search = '';
// 符号状态查询
var state_search = '';

// page load
$(document).ready(function() {
    loadmeta();
    xmltodoc();
    createTree();
});

function init() {
    var canvas2 = document.getElementById("renderCanvas");
    canvas2.width = 800;
    canvas2.height = 600;
    canvas2.style.display = "none";
    var engine2 = new BABYLON.Engine(canvas2, true, {
        preserveDrawingBuffer: true,
        stencil: true
    });
    var scene2 = createScene(canvas2, "models/天气/晴/晴-白天/", "晴-白天.gltf", engine2);
    var flag = 1;
    var salpha = 0.1;
    var myVal = setInterval(function() {
        if (flag < 2) {
            engine2.runRenderLoop(function() {
                if (scene2) {
                    scene2.render();
                }
            });
            myScenes.materials[0]._disableAlphaBlending = false;
            myScenes.materials[0]._alpha = salpha;
            myScenes.materials[0].alpha = salpha;
            flag++;
            salpha = salpha + 0.1;
        } else {
            clearInterval(myVal);
            canvas2.style.display = "block";
        }
    }, 1000);
}

function modifyBtn() {
    var gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: './gif.worker.js'
    }); //创建一个GIF实例
    // 核心方法，向gif中加一帧图像，参数可以是img/canvas元素，还可以从ctx中复制一帧
    //gif.addFrame(imageElement);
    var aa = document.getElementById("renderCanvas");

    // or a canvas element
    for (let i = 0; i < 50; i++) {
        gif.addFrame(aa, { delay: 60 }); //一帧时长是200
    }
    gif.render();
    // or copy the pixels from a canvas context
    //gif.addFrame(aa, {copy: true});

    gif.on('finished', function(blob) { //最后生成一个blob对象
        window.open(URL.createObjectURL(blob));
    });

}

function downloadBtn() {
    var dataJson = JSON.stringify(modelData);
    //第一步
    let blob = new Blob([dataJson], { type: "text/plain;charset=UTF-8" });
    //第二步
    let url = window.URL.createObjectURL(blob);

    //这里你会看到类似的地址：blob:http://localhost:8080/d2dbbe3f-7466-415b-a2d0-387cff290acb
    // console.log(url);
    //动态创建a标签
    let link = document.createElement('a');
    link.style.display = "none";
    link.href = url;
    link.setAttribute('download', 'model.gltf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    let link2 = document.createElement('a');
    link2.style.display = "none";
    link2.href = binUrl;
    document.body.appendChild(link2);
    link2.click();
    document.body.removeChild(link2);

}

async function saveAsFileBtn() {
    const options = {
        types: [{
            description: 'Text Files',
            accept: {
                'bin/plain': ['.bin'],
            },
        }, ],
    };
    let gltfName = fileName + ".gltf";
    let binName = fileName + ".bin";
    let gifName = fileName + ".gif";


    fileHandle = await window.showDirectoryPicker();;
    const gltfHandle = await fileHandle.getFileHandle(gltfName, { create: true });
    const binHandle = await fileHandle.getFileHandle(binName, { create: true });
    const gifHandle = await fileHandle.getFileHandle(gifName, { create: true });

    var gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: './js/gif.worker.js'
    }); //创建一个GIF实例
    // 核心方法，向gif中加一帧图像，参数可以是img/canvas元素，还可以从ctx中复制一帧
    var aa = document.getElementById("renderCanvas");
    for (let i = 0; i < 50; i++) {
        gif.addFrame(aa, { delay: 60 }); //一帧时长是200
    }
    gif.render();
    gif.on('finished', async function(blob) { //最后生成一个blob对象
        //window.open(URL.createObjectURL(blob));
        const gifWriter = await gifHandle.createWritable();
        await gifWriter.write(blob);
        gifWriter.close();
    });

    const gltfWriter = await gltfHandle.createWritable();
    const binWriter = await binHandle.createWritable(options);
    await gltfWriter.write(JSON.stringify(modelData));
    const response = await fetch(binUrl);
    await response.body.pipeTo(binWriter);
    gltfWriter.close();
    binWriter.close();
}


async function openFileBtn() {
    fileHandle = await window.showOpenFilePicker();
    const file = await fileHandle[0].getFile()
    const contents = await file.text()
}


function loadXml(str) {
    if (str == null) {
        return null;
    }
    var doc = str;
    try {
        doc = createXMLDOM();
        doc.async = false;
        doc.loadXML(str);
    } catch (e) {
        doc = $.parseXML(str);
    }
    return doc;
}

function getXmlDoc(dname) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.overrideMimeType('text/xml');
    xhttp.open("GET", dname, false);
    xhttp.send();
    return xhttp.responseXML;

}

// Changes XML to JSON
function convertToJSONs(xmldoc) {
    //准备JSON字符串和缓存（提升性能）
    var jsonStr = "";
    var buffer = new Array();

    buffer.push("[");
    //获取xml文档的所有子节点
    var nodeList = xmldoc.childNodes;
    generate(nodeList);

    /**
     * 中间函数，用于递归解析xml文档对象，并附加到json字符串中
     * @param node_list xml文档的的nodeList
     */
    function generate(node_list) {

        for (var i = 0; i < node_list.length; i++) {
            var curr_node = node_list[i];
            if (curr_node.children.length > 0) {
                if (curr_node.localName != "ALL") {
                    buffer.push("{\"" + "text" + "\":" + "\"" + curr_node.attributes[0].nodeValue + "\"," + "\"" + "nodes" + "\":[");
                }

                generate(curr_node.children);
            } else {
                if (curr_node != null) {
                    //nodeValue不为null
                    buffer.push("{\"" + "text" + "\":" + "\"" + curr_node.attributes[0].nodeValue + "\"}");
                } else {
                    //nodeValue为null
                    buffer.push("\"" + curr_node.nodeName + "\":\"\"");
                }


            }
            if (i < (node_list.length - 1)) {
                buffer.push(",");
            } else {
                buffer.push("]");
            }
        }

        buffer.push("}");
    }
    sxmldata = buffer.join('');
    sxmldata = sxmldata.substring(0, sxmldata.length - 3);
    xmlobj = eval("(" + sxmldata + ")");

}


function zhuanhuan() {
    convertToJSONs(xmldoc);
}

function xmltodoc() {
    xmldoc = getXmlDoc("meta.xml");
    convertToJSONs(xmldoc);
}

function loadmeta() {
    $.get("meta.xml", function(xmldata) {

        $(xmldata)
            .find("ALL")
            .find("C1").find("S")
            .each(function() {
                var model3 = {};
                model3.name = $(this).attr("name");
                model3.code = $(this).attr("code");
                model3.desc = $(this).attr("descrption");
                model3.dimesion = $(this).attr("dimesion");
                model3.state = $(this).attr("state");
                model3.file = $(this).attr("file");

                if (model3.file == undefined) {
                    model3.file = model3.name + ".gltf";
                }

                model3.thumb = model3.name + "." + $(this).attr("thumbnail");
                if ($(this).attr("thumbnail") == undefined) {
                    model3.thumb = model3.name + ".gif";
                }

                if (model3.thumb == undefined) {
                    model3.thumb = model3.name + ".gif";
                }



                model3.baseurl = "models/";
                model3.class1 = $(this).parents("C1").attr("name");
                if (model3.class1) {
                    model3.baseurl += model3.class1 + "/";
                }

                model3.class2 = $(this).parents("C2").attr("name");
                if (model3.class2) {
                    model3.baseurl += model3.class2 + "/";
                }
                model3.class3 = $(this).parents("C3").attr("name");
                if (model3.class3) {
                    model3.baseurl += model3.class3 + "/";
                }

                model3.class4 = $(this).parents("C4").attr("name");
                if (model3.class4) {
                    model3.baseurl += model3.class4 + "/";
                }

                model3.class5 = $(this).parents("C5").attr("name");
                if (model3.class5) {
                    model3.baseurl += model3.class5 + "/";
                }

                model3.class6 = $(this).parents("C6").attr("name");
                if (model3.class6) {
                    model3.baseurl += model3.class6 + "/";
                }
                //baseurl is the directory of model files
                
                model3.class7 = $(this).parents("C7").attr("name");
                if (model3.class7) {
                    model3.baseurl += model3.class7 + "/";
                }

                model3.baseurl += model3.name + "/";
                model3.fullfile = model3.baseurl + model3.file;
                model3.fullthumb = model3.baseurl + model3.thumb;
                model3.fullreadme = model3.baseurl + "readme.xml";

                models.push(model3);
            });

        QueryBaseText("天气");
    });
}

//获得
function getModelInfo() {
    if (models) {
        if (models.length > 0) {
            models.forEach(function(el, i) {
            });
        }
    }
}

function createTree() {
    $("#modelTree").treeview({
        data: xmlobj, // 赋值
        onNodeSelected: function(event, data) {
            QueryBaseText(data.text);
        },
        highlightSelected: true,
        multiSelect: false,
        showCheckbox: false,
        highlightSearchResults: true,
        levels: 10
    });
    $("#modelTree").treeview('collapseAll');
}

function modelFromClass1(modelArray) {
    $("#thumbcontainer").empty();
    var allClass1 = [];
    if (modelArray) {
        if (modelArray.length > 0) {
            modelArray.forEach(function(el, i) {
                if (el.class1) {
                    if (!allClass1.includes(el.class1)) {
                        allClass1.push(el.class1);
                    }
                }
            });

        }
    }
    if (allClass1.length > 0) {
        allClass1.forEach(function(el, i) {
            var newArray = [];
            for (var i = 0; i < modelArray.length; i++) {
                if (modelArray[i].class1 == el) {
                    newArray.push(modelArray[i]);
                }
            }
            createThumbList(el, newArray);
        });
    }

}

function createThumbList(caption, modelArray) {

    if (modelArray) {
        if (modelArray.length > 0) {
            var rowCaption = $("<div class='well'></div>");
            var h5Cpation = $("<h4</h4>").text(caption + `动态符号，共计` + modelArray.length.toString() + "个");
            rowCaption.append(h5Cpation);
            $("#thumbcontainer").append(rowCaption);

            var rowNum = Math.ceil(modelArray.length / 4);

            for (var i = 0; i < rowNum; i++) {
                var row = $("<div class='row'></div>");

                for (var j = i * 4; j < Math.min((i + 1) * 4, modelArray.length); j++) {
                    var model = modelArray[j];

                    if (model) {
                        var thumb = $("<div class='thumbnail'></div>");
                        var image = $("<img></img>").attr("src", model.fullthumb)
                            .attr("alt", model.name).css("height", "200px");
                        image.click(function() {
                            debugger;
                            document.querySelector("#slider").value = 0

                            $("#modelviewer").modal();

                            var canvas = document.getElementById("renderCanvas");
                            var engine = new BABYLON.Engine(canvas, true, {
                                preserveDrawingBuffer: true,
                                stencil: true
                            });
                            var clickModel = null;
                            for (var ii = 0; ii < models.length; ii++) {
                                if (models[ii].name == $(this).attr("alt")) {
                                    clickModel = models[ii];
                                    break;
                                }
                            }
                            if (clickModel) {
                                debugger;
                                $("#titleLabel").text("名称：" + clickModel.name + " 符号地址：" + clickModel.fullfile);
                               
                                fileName = clickModel.name;
                                var modelUrl = "./" + clickModel.baseurl + clickModel.file;
                                $.get(modelUrl, function(data) {
                                    //debugger;
                                    modelData = data;
                                })
                                
                                binUrl = "./" + clickModel.baseurl + clickModel.name + ".bin";
                                $.get(binUrl, function(data) {
                                    //debugger;
                                    binData = data;
                                })
                                var scene = createScene(canvas, clickModel.baseurl, clickModel.file, engine);

                                var $document = $(document);
                                var selector = '[data-rangeslider]';
                                var $inputRange = $(selector);

                                $document.on('input', selector, function(e) {
                                    //debugger;
                                    let index = parseInt($("#myPart").val()) - 1;
                                    let alpha = (100 - parseFloat(e.target.value)) / 100;
                                    myScenes.materials[index]._disableAlphaBlending = false;
                                    myScenes.materials[index]._alpha = alpha;
                                    myScenes.materials[index].alpha = alpha;
                                    modelData.materials[index].alphaMode = "BLEND";
                                    modelData.materials[index].pbrMetallicRoughness.baseColorFactor[3] = alpha;

                                });
                                $('#color').colorpicker().on('changeColor', function(e) {
                                    let index = parseInt($("#myPart").val()) - 1;
                                    myScenes.materials[index].albedoColor.r = e.color.toRGB().r / 255;
                                    myScenes.materials[index].albedoColor.g = e.color.toRGB().g / 255;
                                    myScenes.materials[index].albedoColor.b = e.color.toRGB().b / 255;
                                    if (modelData.materials[index].pbrMetallicRoughness && modelData.materials[index].pbrMetallicRoughness.baseColorFactor) {
                                        modelData.materials[index].pbrMetallicRoughness.baseColorFactor[0] = e.color.toRGB().r / 255;
                                        modelData.materials[index].pbrMetallicRoughness.baseColorFactor[1] = e.color.toRGB().g / 255;
                                        modelData.materials[index].pbrMetallicRoughness.baseColorFactor[2] = e.color.toRGB().b / 255;
                                    }


                                    scene.render();
                                });
                                engine.runRenderLoop(function() {
                                    if (scene) {
                                        scene.render();
                                    }
                                });
                                canvas.width = 820;
                                canvas.height = 400;
                            }

                        });

                        var caption = $("<div class='caption'></div>").append("<h3></h3>").html(model.name);
                        var downloadA = $("<a>下载</a>").attr("href", model.fullfile).css("float", "right");
                        caption.append(downloadA);
                        thumb.append(image);
                        thumb.append(caption);


                        var column = $("<div class='col-md-3'></div>").append(thumb);


                        row.append(column);
                    }
                }
                $("#thumbcontainer").append(row);
            }
        }
    }
}

function setScale() {
    var scale = $("#scale").val();
    for (let i = 1; i < myScenes.meshes.length; i++) {
        var x = myScenes.meshes[i].scaling.x;
        var y = myScenes.meshes[i].scaling.y;
        var z = myScenes.meshes[i].scaling.z;
        myScenes.meshes[i].scaling.x = scale * x;
        myScenes.meshes[i].scaling.y = scale * y;
        myScenes.meshes[i].scaling.z = scale * z;
    }
}

function createScene(canvas, baseurl, gltf, engine) {
    $('#color').colorpicker({
        color: '#AA3399',
        format: 'rgb',
        fallbackFormat: 'rgb'
    });
    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.HemisphericLight();

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    var loader = BABYLON.SceneLoader.Append(baseurl, gltf, scene, function(newScenes) {
        $("#myPart").empty();
        for (let i = 1; i < newScenes.materials.length + 1; i++) {
            var partnode = "<option value=" + i + ">" + "部件" + i + "</option>"
            $("#myPart").append(partnode)
        }
        myScenes = newScenes;
        scene.activeCamera = null;
        scene.createDefaultCameraOrLight(true);
        scene.activeCamera.attachControl(canvas, false);
        newScenes.downloadFiles();
    });

    loader.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.ALL;

    return scene;
}

function Query() {
    sname = txt_name.value;
    if (sname == "" || sname == null) {
        modelsQueryResult = eval(models); //json是你的json变量名
        modelFromClass1(modelsQueryResult);

    } else {
        modelsQueryResult = [];
        models = eval(models);
        for (var i = 0; i < models.length; i++) {
            if ((models[i].name).indexOf(sname) > -1) { //name为你需要遍历的变量
                modelsQueryResult.push(models[i]);
            }
        }
        modelFromClass1(advancedSelector(modelsQueryResult));
    }
}

function QueryBaseText(stext) {
    modelsQueryResult = [];
    models = eval(models);
    for (var i = 0; i < models.length; i++) {
        if (models[i].class1 == stext) {
            modelsQueryResult.push(models[i]);
        } else if (models[i].class2 == stext) {
            modelsQueryResult.push(models[i]);
        } else if (models[i].class3 == stext) {
            modelsQueryResult.push(models[i]);
        } else if (models[i].class4 == stext) {
            modelsQueryResult.push(models[i]);
        } else if (models[i].class5 == stext) {
            modelsQueryResult.push(models[i]);
        } else if (models[i].class6 == stext) {
            modelsQueryResult.push(models[i]);
        }else if (models[i].class7 == stext) {
            modelsQueryResult.push(models[i]);
        }
         else if (models[i].name == stext) {
            modelsQueryResult.push(models[i]);
        }

    }
    modelFromClass1(modelsQueryResult);
}

function CheckDimension(value) {
    if (!$("#chktwo").is(':checked') && !$("#chkthree").is(':checked')) {
        dimension_search = '';
    } else {
        if (value == '二维') {
            $("#chktwo").attr("checked", true);
            $("#chkthree").attr("checked", false);
            dimension_search = value;
        }
        if (value == '三维') {
            $("#chktwo").attr("checked", false);
            $("#chkthree").attr("checked", true);
            dimension_search = value;
        }
    }
}


function CheckStatus(value) {
    if (!$("#chkstatic").is(':checked') && !$("#chkdynamic").is(':checked')) {
        state_search = ''
    } else {
        if (value == '静态') {
            $("#chkstatic").attr("checked", true);
            $("#chkdynamic").attr("checked", false);
            state_search = value;
        }
        if (value == '动态') {
            $("#chkstatic").attr("checked", false);
            $("#chkdynamic").attr("checked", true);
            state_search = value;
        }
    }
}


function advancedSelector(arr) {
    var newArr = [];
    if (dimension_search.length == 0 && state_search.length == 0) {
        return arr;
    } else if (dimension_search.length != 0 && state_search.length == 0) {
        newArr = arr.filter(item => {
            return item.dimesion == dimension_search;
        });
        return newArr;
    } else if (dimension_search.length == 0 && state_search != 0) {
        newArr = arr.filter(item => {
            return item.state == state_search;
        });
        return newArr;
    } else {
        let allArr = []
        newArr = arr.filter(item => {
            return item.dimesion == dimension_search;
        });
        if (newArr.length == 0) {
            return [];
        } else {
            allArr = newArr.filter(item => {
                return item.state == state_search;
            });
            return allArr;
        }
    }
}
