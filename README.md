<h1 align=center>多维动态符号设计与管理系统</h1>

## 项目说明

> 💡本项目为课题组项目，所属项目为全息地图获取与位置信息聚合技术。项目总体分为两个大的部分，分别是<strong>符号库设计与管理</strong>和<strong>个人符号库管理</strong>。

> 🛠️<strong>符号库设计与管理</strong>采用的技术栈为<strong>JQuery</strong>和<strong>babylon.js</strong>，该部分分为四个模块，分别是: <strong>符号库符号模型展示(主页面)</strong>、<strong>符号库目录树查询</strong>、<strong>符号的模糊检索和高级检索</strong>和<strong>符号模型三维展示及参数修改</strong>。

> 🔑<strong>个人符号库管理</strong>采用前后端分离技术，前端采用的技术栈为<strong>Vue</strong>和<strong>babylon.js</strong>；后端采用的技术栈为<strong>Node.js</strong>和<strong>Express</strong>；WebGL三维模型可视化采用的技术栈为<strong>babylon.js</strong>。该部分分为三个模块，分别是: <strong>个人符号模型展示</strong>、<strong>个人符号模型上传</strong>和<strong>个人符号模型删除</strong>。

> 🍭如果您有疑问请直接在 Issues 中进行提问，欢迎大家积极提问。

## 相关技术栈

- **📑前端框架：**[JQuery](https://github.com/jquery/jquery)、[Vue](https://cn.vuejs.org/index.html)

- **⚙️后端框架：**[Node.js](https://github.com/nodejs/node)、[Express](https://github.com/expressjs/express)

- **🌍WebGL可视化框架：**[babylon.js](https://www.babylonjs.com/)

- **📦UI组件：**[Element UI](https://element.eleme.cn/#/zh-CN)

## 注意事项

- **由于项目中所依赖的模型数据太过庞大，本repository中的模型数据并不完整，如果您想要完整的模型数据、可以点击[这里](https://pan.baidu.com/s/1uU8JaHvjmBH6tyxpGyKlRw)，提取码为`gcxz`**
- **项目中所使用的符号模型数据属于个人数据，并不属于开源数据，仅供个人使用，因此请勿将数据发布到相关公共资源网站上，一经发现将会追究其相关责任。**

## 运行项目

```
1. 克隆到本地
git clone https://github.com/Cartographic-group-of-Hubei-University/vue-cesium-visualization.git

2. 进入文件夹
cd symbol-visualization-system 

3. 开启本地服务
node app.js

4. 进入项目中的server文件夹
cd public
cd server

5. 开启后端服务
npm start

6. 在浏览器中输入http://localhost:9000/index.html，进入项目主页
```

## 符号库设计与管理部分功能展示

### 符号库符号模型展示

项目整体布局分为目录树、导航头部与搜索栏、模型信息展示这三个部分。目录树允许用户按照模型类别查找模型，搜索栏支持用户模糊查询，相关的模型信息将在页面中间部分进行展示。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/vue-cesium-visualization/raw/master/images/cesium1.gif"></div>

### 符号库目录树查询

结合`JQuery`和`xml`文件生成目录树，点击左侧目录树，显示对应类别的所有符号模型信息；同时，也可以根据目录树查看对应符号模型所属的类别。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/vue-cesium-visualization/raw/master/images/cesium2.gif"></div>

### 符号的模糊检索和高级检索

在“搜索框”中输入关键字对符号模型进行模糊搜索，可以对查询到的相关符号进行展示。

在“高级检索”中，可以勾选二维/三维符号、静态/动态符号来对模型数据进行进一步的筛选。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/vue-cesium-visualization/raw/master/images/cesium2.gif"></div>

### 符号模型三维展示及参数修改

使用`babylon.js`对符号模型进行展示，显示其归属类别、名称、模型存放地址等，并允许对符号模型中的相关参数(部件颜色、透明度、缩放比例)进行修改；同时，也支持对原模型以及修改后的模型进行本地下载，将符号模型数据下载到本地。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/vue-cesium-visualization/raw/master/images/cesium2.gif"></div>

## 个人符号库管理

### 个人符号模型展示

前端使用`Vue`框架来搭建整个页面，结合`Element UI`实现页面的整体布局，将个人的符号模型及其相关的描述信息以列表的形式进行展示。

通过`babylon.js`来对符号模型进行展示，显示模型的纹理以及立体效果，并且可以对模型进行缩放和全视角旋转。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/symbol-visualization-system/raw/master/images/personal1.gif"></div>
<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/symbol-visualization-system/raw/master/images/personal2.gif"></div>

### 个人符号模型上传

结合`Node`中`multer`和`compressing`这两个中间件实现文件的上传与解压。其中`multer`中间件是用来进行文件上传的，`compressing`中间件是用来进行文件解压的。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/symbol-visualization-system/raw/master/images/personal3.gif"></div>

### 个人符号模型删除

客户端点击“删除”按钮，后端结合对应的接口获取需要删除的符号信息，通过`fs`模块中的`unlinkSync`方法将后端中存储的相应符号进行删除。

<div align=center><img src="https://github.com/Cartographic-group-of-Hubei-University/symbol-visualization-system/raw/master/images/personal4.gif"></div>
