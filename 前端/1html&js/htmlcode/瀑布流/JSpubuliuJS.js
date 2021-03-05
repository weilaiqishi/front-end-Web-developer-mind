window.onload = function () {
    imgLocation("container","box");
    var imgData={"data":[{"src":"0.jpg"},{"src":"1.jpg"},{"src":"2.jpg"},{"src":"3.jpg"},{"src":"4.jpg"},{"src":"5.jpg"},{"src":"6.jpg"},{"src":"7.jpg"},{"src":"8.jpg"},{"src":"9.jpg"}]};
    //监听滚动条
    window.onscroll = function(){
        if(checkFlag()){
            //加载时动态创建
            var cparent = document.getElementById("container");
            for(var i = 0;i<imgData.data.length;i++){
                var ccontent = document.createElement("div");
                ccontent.className="box";
                cparent.appendChild(ccontent);
                var boximg= document.createElement("div");
                boximg.className="box_img";
                ccontent.appendChild(boximg);
                var img = document.createElement("img");
                img.src = "img/"+imgData.data[i].src;
                boximg.appendChild(img);
            }
            //再次排序
            imgLocation("container","box");
        }
    }
}

//需求三 判断是否要加载
function checkFlag(){
    var cparent = document.getElementById("container");
    var ccontent = getChildElement(cparent,"box");
    //最后一张图片到顶部的高度
    var lastContentHeight = ccontent[ccontent.length - 1].offsetTop;
    //被上面隐藏的内容高度
    var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
    //页面看到部分的高度
    var pageHeight = document.documentElement.clientHeight||document.body.clientHeight;
    //当1< 2+3时 就得刷新了
    if(lastContentHeight<scrollTop+pageHeight){
        return true;
    }
}

function imgLocation(parent,content) {
    //将parent下的所有内容取出
    var cparent = document.getElementById(parent);
    var ccontent = getChildElement(cparent,content);
    //固定容器宽度方便管理
    var imgWidth = ccontent[0].offsetWidth;
    var cols = Math.floor(document.documentElement.clientHeight / imgWidth);
    cparent.style.cssText = "width:"+imgWidth*cols+"px;margin:0 auto;";

    //取得已放图片的高度
    var BoxHeightArr=[];
    for(var i = 0;i<ccontent.length;i++){
        //第一排的正常存起
        if(i<cols){
            BoxHeightArr[i] = ccontent[i].offsetHeight;
            //超过的先找高度最小以及它的位置，安放的操作则是把box弄成绝对布局，top为最小高度，left为上面box的offsetLeft
            //安防后更新高度数列
        }else{
            var minheight = Math.min.apply(null,BoxHeightArr);
            var minIndex = getminheightLocation(BoxHeightArr,minheight);
            ccontent[i].style.position = "absolute";
            ccontent[i].style.top = minheight+"px";
            ccontent[i].style.left = ccontent[minIndex].offsetLeft+"px";
            BoxHeightArr[minIndex] = BoxHeightArr[minIndex]+ccontent[i].offsetHeight;
        }
    }
}

function  getminheightLocation(BoxHeightArr,minHeight) {
    for(var i in BoxHeightArr){
        if(BoxHeightArr[i] == minHeight){
            return i;
        }
    }
}

function getChildElement(parent,content) {
    //第一步把所有的存到数组
    //第二部用数组[i].className属性匹配content
    var contentArr = [];
    var allcontent = parent.getElementsByTagName("*");
    for(var i = 0;i<allcontent.length;i++){
        if(allcontent[i].className==content){
            contentArr.push(allcontent[i]);
        }
    }
    return contentArr;
}

