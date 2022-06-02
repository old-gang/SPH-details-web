window.onload = function () {

    //   声明一个用于存储放大镜大图索引的变量
    var prevViewId = 0;
    //  路径导航
    conPoin();
    function conPoin() {
        //  获取父元素
        var conPoin = document.querySelector('.wrap .mainCon .conPoin');
        //  获取数据
        var path = goodData.path;

        //  当前path数组的长度 决定了a标签的个数  数组的每个元素都是一个对象  对象上的title属性 决定了a标签的文本
        //  url属性 决定了a标签href属性的地址   并且每一个a标签后边 都要追加一个i标签   用于存放 /
        //  但是最后一个a标签   既没有href也没有斜线
        path.forEach(function (item, index) {
            //  创建a标签
            var aNode = document.createElement('a');
            aNode.innerHTML = item.title;
            conPoin.appendChild(aNode);
            if (index != path.length - 1) {
                //  只要能够进入这个if当中  说明当前元素不是最后一个
                aNode.href = item.url;
                var iNode = document.createElement('i');
                iNode.innerHTML = '/';
                conPoin.appendChild(iNode);
            }
            //  判断当前a标签是不是最后一个
            //     if(index == path.length - 1){
            //     //  只要能够进入这个if当中 则说明 当前遍历的索引  为索引最大值  肯定是最后一个元素了
            //         conPoin.appendChild(aNode);
            //     }else{
            //         aNode.href = item.url;
            //         conPoin.appendChild(aNode);
            //         var iNode = document.createElement('i');
            //         iNode.innerHTML = '/';
            //         conPoin.appendChild(iNode);
            //     }

        })

    }
    //  放大镜
    prevView();
    function prevView() {

        //  获取父元素
        var prevViewNode = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .prevView')
        //  获取小图容器
        var zoomImgBox = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .prevView .zoomImgBox')
        //  获取图片数据
        var imagesSrc = goodData.imagessrc;
        //  获取小图元素
        var smallImg = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .prevView .zoomImgBox img');
        //  小图默认的路径  就应该是我们图片数据当中 第一个元素（对象） 的s属性对应的图片
        smallImg.src = imagesSrc[0].s;
        //  定义一个标识变量用于判断当前浏览器中是否存在蒙版元素
        var maskNode = null;
        var bigImgBox = null;
        var bigImg = null;

        //  鼠标移入放大镜区域之后 才会触发后续的行为  所以我们将移动事件和移出事件绑定在移入的回调函数当中
        prevViewNode.onmouseenter = function () {
            // console.log('移入');
            //  在移入时  创建放大镜区域的动态元素  蒙版  大图容器 大图

            //  当你想要让一个结果为false的表达式 执行if的逻辑时  直接对该表达式取反  false进if  true进else
            if (!maskNode) {
                maskNode = document.createElement('div');
                maskNode.className = 'mask';
                zoomImgBox.appendChild(maskNode);

                bigImgBox = document.createElement('div');
                bigImgBox.className = 'bigImgBox';
                prevViewNode.appendChild(bigImgBox);

                // bigImg = document.createElement('img');
                //  这个写法  和createElement  得到的img标签  在使用上没有任何的区别
                bigImg = new Image();
                // bigImg.src = 'images/b1.png';
                //  每一次移入放大镜区域的时候 根据之前保存的缩略图点击的索引
                //  去图片路径的数组当中 访问对应的那个对象的b属性
                bigImg.src = imagesSrc[prevViewId].b;
                bigImgBox.appendChild(bigImg)

            }

            zoomImgBox.onmousemove = function (event) {
                // console.log('移出');
                //  计算蒙版位置 = 鼠标坐标 - 父容器相对于视口的位置 - 蒙版自身宽高的一半
                // 声明一个对象 蒙版位置
                var maskPosition = {
                    left: event.clientX - prevViewNode.getBoundingClientRect().left - maskNode.offsetWidth / 2,
                    top: event.clientY - prevViewNode.getBoundingClientRect().top - maskNode.offsetHeight / 2
                }

                //  边界值判断  范围限定
                if (maskPosition.left < 0) {
                    maskPosition.left = 0
                } else if (maskPosition.left > prevViewNode.clientWidth - maskNode.offsetWidth) {
                    maskPosition.left = prevViewNode.clientWidth - maskNode.offsetWidth
                }
                if (maskPosition.top < 0) {
                    maskPosition.top = 0
                } else if (maskPosition.top > prevViewNode.clientHeight - maskNode.offsetHeight) {
                    maskPosition.top = prevViewNode.clientHeight - maskNode.offsetHeight
                }

                //  设置蒙版位置
                maskNode.style.left = maskPosition.left + 'px';
                maskNode.style.top = maskPosition.top + 'px';

                // 大图跟随移动
                //  计算移动比 = 蒙版的可移动空间(小图容器内容宽度 - 蒙版外边界宽度) / 大图的可移动空间（大图外边界宽度 - 大图容器内容宽度）
                var scale = (zoomImgBox.clientWidth - maskNode.offsetWidth) / (bigImg.offsetWidth - bigImgBox.clientWidth)
                // console.log(scale);
                //  计算大图位置
                var bigImgPosition = {
                    left: maskPosition.left / scale,
                    top: maskPosition.top / scale
                }

                //  设置大图位置
                bigImg.style.marginLeft = -bigImgPosition.left + 'px';
                bigImg.style.marginTop = -bigImgPosition.top + 'px';

            }
            zoomImgBox.onmouseleave = function () {
                zoomImgBox.onmousemove = zoomImgBox.onmouseleave = null;

                zoomImgBox.removeChild(maskNode);
                prevViewNode.removeChild(bigImgBox);
                //  删除元素后 重置标识变量
                // 即使删除了元素，dom元素还是会存在于堆内存中
                maskNode = null;
            }
        }
    }
    //  缩略图移动逻辑
    thumbnailMove();
    function thumbnailMove() {
        //  获取按钮
        var prev = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .thumbnail > a.prev')
        var next = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .thumbnail > a.next')
        //  获取图片容器
        var ulNode = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .thumbnail .list ul')

        //  缩略图动态渲染
        //  数组的长度决定了li的个数  每一个li当中 都有一个img元素
        //  用数组当中每一个元素（对象）的s属性   对当前这个img标签的src属性进行赋值
        //  获取图片数据
        var imagesSrc = goodData.imagessrc;
        imagesSrc.forEach(function (item) {
            //  当前的item  就是数组当中的每一个对象  比如： { b: "./images/b1.png", s: "./images/s1.png" }
            var liNode = document.createElement('li');
            var imgNode = new Image();
            imgNode.src = item.s;
            liNode.appendChild(imgNode);
            ulNode.appendChild(liNode)
        })

        //  获取li集合
        var liNodes = document.querySelectorAll('.wrap .mainCon .infoWrap .prevViewWrap .thumbnail .list ul li')
        //  定义显示图片张数
        var showNum = 5;
        //  定义移动张数
        var moveNum = 2;
        //  总偏移    (图片总数 - 显示图片张数) * （ 单张图片的宽度 + 20）
        var offset = (liNodes.length - showNum) * (liNodes[0].offsetWidth + 20);
        //  单次移动 = 移动张数 * （ 单张图片宽度 + 20 ）
        var itemOffset = moveNum * (liNodes[0].offsetWidth + 20);
        //console.log(itemOffset);
        //  已走距离   本质就是一个计数变量  每次移动之后  重新计算一下就可以了
        var tempLeft = 0;

        next.onclick = function () {
            //  先判断当前按钮到底能不能点击  只要还有剩余空间 一定是可以点击的  不管够不够单次
            //  剩余距离 = 总偏移 - 已走距离

            if (offset - tempLeft > 0) {
                // 只要能够进入这个if当中 则说明当前一定还有剩余空间 我们可以移动
                //  接下来我们就需要分析  到底如何移动了
                //  1. 剩余空间 > 单次偏移   正常移动单次偏移
                //  2. 剩余空间 <= 单次偏移  （不大于就是小于等于）  我们直接走剩余  因为一定是最后一步了

                if (offset - tempLeft > itemOffset) {
                    tempLeft += itemOffset;
                } else {
                    // tempLeft += offset - tempLeft
                    // tempLeft = tempLeft + offset - tempLeft;
                    tempLeft = offset;
                }
                ulNode.style.left = -tempLeft + 'px';
            }

        }

        prev.onclick = function () {

            //  对于prev按钮来说 点击next按钮已经移动过来的图片（距离）  就是我们的总偏移和剩余距离
            //  只要tempLeft 大于0  就说明用户曾经点击过next按钮  向左移动过图片 prev按钮可以点击
            if (tempLeft > 0) {

                if (tempLeft > itemOffset) {
                    tempLeft -= itemOffset;
                } else {
                    tempLeft = 0;
                }
                ulNode.style.left = -tempLeft + 'px';
            }
        }
    }
    //  缩略图点击逻辑
    thumbnailClick();
    function thumbnailClick() {

        //  获取li集合
        var liNodes = document.querySelectorAll('.wrap .mainCon .infoWrap .prevViewWrap .thumbnail .list ul li')
        //  获取小图
        var smallImg = document.querySelector('.wrap .mainCon .infoWrap .prevViewWrap .prevView .zoomImgBox img')

        //  循环事件绑定
        for (var i = 0; i < liNodes.length; i++) {
            liNodes[i].index = i;
            liNodes[i].onclick = function () {
                //  将当前点击的li内部的img的src  设置给小图的src
                smallImg.src = this.firstElementChild.src;
                //  小图和缩略图的路径 是s1.png   大图的路径是b1.png
                //  缩略图点击的逻辑当中 是不能够直接操作大图的路径的
                //  因为但凡你可以触发缩略图点击的逻辑   鼠标一定就不在放大镜区域内
                //  大图一定还没有创建

                //  我们通过数据的动态渲染 可以确定  当我们点击某一个li的时候 使用这个li的索引
                //  在数组中一定可以访问到对应的数据（对象）   且这个对象的b属性  一定是对应的大图的路径
                // console.log(this.index);
                prevViewId = this.index;
            }
        }

    }

    //  筛选区域逻辑
    choose();
    function choose() {
        //  获取数据
        var crumbData = goodData.goodsDetail.crumbData;
        //  获取父元素
        var chooseArea = document.querySelector('.wrap .mainCon .infoWrap .info .choose .chooseArea')
        //  获取选择结果元素
        var choosed = document.querySelector('.wrap .mainCon .infoWrap .info .choose .choosed');
        //  crumbData数组的长度决定了dl的个数，数组中每一个元素都是一个对象  包含title和data两个属性
        //  title决定了dt的文本
        //  每一个对象当中的data属性（数组）的长度决定了这个dl当中dd的个数  data的元素值 决定了dd的文本
        crumbData.forEach(function (item) {
            //  此处的item  对应的是crumbData数组当中的每一个元素（对象）  包含title和data两个属性
            var dlNode = document.createElement('dl');
            var dtNode = document.createElement('dt');
            //  title对应dt的文本
            dtNode.innerHTML = item.title;
            dlNode.appendChild(dtNode);
            chooseArea.appendChild(dlNode)

            item.data.forEach(function (item) {
                //  此处的item  是data当中的元素  是一个对象
                //  包含type和changeprice两个属性  type为dd的文本  changeprice是价格改变的参数
                var ddNode = document.createElement('dd');
                ddNode.innerHTML = item.type;
                //  给dd增加自定义属性   用于存储当前选项对应的价格信息
                ddNode.setAttribute('changeprice', item.changePrice);
                dlNode.appendChild(ddNode)
            })
        })

        //  获取dl集合
        var dlNodes = document.querySelectorAll('.wrap .mainCon .infoWrap .info .choose .chooseArea > dl');
        //  声明一个和dl长度相等的数组 当用户点击行为产生的时候 我们需要根据当前点击的dd 获取其父元素的索引
        //  然后向数组中对应的位置 存储内容 这样我们的选择结果就是有序得了   创建选择结果的结构的时候
        //  只需要遍历数组 有内容的情况下  创建对应结构  无内容的情况下 说明该选项没有被选择过 直接忽略不管
        var arr = new Array(dlNodes.length);
        // for (var i = 0; i < arr.length; i++) {
        //     arr[i] = 0;
        // }
        //  数组填充方法
        arr.fill(0)
        console.log(arr);
        for (var i = 0; i < dlNodes.length; i++) {
            //  给dl添加索引
            dlNodes[i].index = i;
            (function () {
                //  获取dd集合  但是因为我们需要将dd分为4组单独进行访问 所以要根据每一个dl  去获取dd
                var ddNodes = dlNodes[i].getElementsByTagName('dd');

                //   循环事件绑定  给每一组dd集合 都进行遍历
                for (var j = 0; j < ddNodes.length; j++) {
                    ddNodes[j].onclick = function () {
                        //  排它实现高亮切换  先操作当前这一组dd  取消高亮 然后再给当前点击的dd添加高亮
                        for (var i = 0; i < ddNodes.length; i++) {
                            ddNodes[i].style.color = '#666'
                        }
                        this.style.color = 'red';
                        //  我们要在用户点击dd的时候 更具当前点击的dd的父元素dl的索引对选择结果进行存储
                        //     console.log(this.parentNode.index);
                        //  增加了价格计算的逻辑之后 我们现在需要两个信息 1.选择过得dd的文本 用来创建mark结构
                        //                                        2.价格属性 用来计算价钱
                        //  所以我们要将数组中存储的内容 从原来的文本 变成当前dd这个元素本身（dom对象）
                        arr[this.parentNode.index] = this;
                        //  点击dd  增加了筛选条件 需要重新计算价钱
                        priceSum(arr)
                        // console.log(arr[1].getAttribute('changeprice'));
                        console.log(arr);
                        //  在创建新的选择结果之前 将选择结果的父元素 清空一次
                        choosed.innerHTML = '';
                        //  创建选择结果
                        arr.forEach(function (item, index) {

                            //  item对应的是 arr数组中的每一个元素（可能是选择过得dd 可能是0）
                            //  判断当前元素是否为0（是否有内容）  有内容则说明当前选项被选择过 创建mark结构即可
                            //  如果为0  则说明没有操作过该选项  忽略即可
                            if (item) {
                                //  只要能够进入这个if当中 则说明当前item 有内容 执行创建的逻辑即可
                                //  当前的item 是我们选择过得dd
                                var markNode = document.createElement('mark');
                                markNode.innerHTML = item.innerHTML;
                                var aNode = document.createElement('a');
                                aNode.innerHTML = 'X';
                                //  在创建a标签的时候  基于当前item对应的索引 给a标签增加一个标记 用于删除逻辑
                                aNode.setAttribute('num', index);
                                markNode.appendChild(aNode);
                                choosed.appendChild(markNode);
                            }
                        })
                        //  删除逻辑
                        //  1.删除当前点击的a标签对应的mark结构
                        //  2.重置当前删除的a标签 对应的那组dd的高亮状态
                        //  3.将当前删除的选项  在数组中对应位置的元素 清除为0
                        //  获取a标签集合
                        var aNodes = document.querySelectorAll('.wrap .mainCon .infoWrap .info .choose .choosed > mark > a')

                        for (var k = 0; k < aNodes.length; k++) {
                            aNodes[k].onclick = function () {
                                //  获取当前点击的a标签对应的索引
                                var num = parseInt(this.getAttribute('num'));
                                //  1.删除mark结构
                                choosed.removeChild(this.parentNode);
                                //  2.根据当前a标签的索引 清除对应的那个dl下所有dd的高亮
                                //  在给当前这一组的第一个dd添加高亮
                                var nowDdNodes = dlNodes[num].getElementsByTagName('dd');
                                for (var i = 0; i < nowDdNodes.length; i++) {
                                    nowDdNodes[i].style.color = '#666';
                                }
                                nowDdNodes[0].style.color = 'red';
                                //  3.将数组对应位置上的元素删除
                                arr[num] = 0;
                                //  点击a标签  删除了筛选条件 需要重新计算价钱
                                priceSum(arr);
                                console.log(arr);
                            }
                        }
                    }
                }
            })();
        }
        //  封装计算价钱的函数
        //  点击dd增加条件  点击a标签删除条件   价格都会变   我们就需要调用该函数  重新计算价钱
        //  其实说白了  只要是arr数组发生改变  条件就一定改变了  我们就需要重新计算
        function priceSum(arr) {
            //  获取商品原价
            var price = goodData.goodsDetail.price;
            //  获取存放价格的元素
            var priceNode = document.querySelector('.wrap .mainCon .infoWrap .info .priceArea > div.priceTop > p.price > em');
            //  遍历这个数组  然后用商品原价  +=  每一个选择过得dd的changeprice  最终的结果就是商品最终价
            arr.forEach(function (item) {
                //  当前的item  对应的是   用户选择过得dd或者0
                //  如果当前item  隐式类型转换为true  则说明是dd  直接获取changeprice 和 原价相加
                //  如果当前item  隐式类型转换为false 则说明这个选项没有被操作过 直接忽略即可
                if (item) {
                    price += item.getAttribute('changeprice') * 1;
                }
            })
            //  将计算好的价钱 设置给元素当文本
            priceNode.innerHTML = price;

            //  获取复选框集合
            var checkNodes = document.querySelectorAll('.wrap .mainCon .detail .detailWrap .fitting .goods .list > li input');
            //  获取商品现价标签
            var masterPNode = document.querySelector('.wrap .mainCon .detail .detailWrap .fitting .goods .master > p')
            //  获取商品套餐价标签
            var resultPNode = document.querySelector('.wrap .mainCon .detail .detailWrap .fitting .goods .result > p')

            //  设置商品现价
            masterPNode.innerHTML = '¥' + price;
            //  计算搭配
            for (var i = 0; i < checkNodes.length; i++) {
                if (checkNodes[i].checked) {
                    price += checkNodes[i].value * 1;
                }
            }
            //  代码执行到此处  咱们的price就已经是商品套餐价了
            resultPNode.innerHTML = '¥' + price;

        }

    }
    //  侧边栏tab切换
    //     asideTab();
    //     function asideTab() {
    //     //  获取按钮集合
    //         var tabBtns = document.querySelectorAll('.wrap .mainCon .detail > aside .tabBtns > h4');
    //     //  获取内容区集合
    //         var tabContents = document.querySelectorAll('.wrap .mainCon .detail > aside .tabContents > div');
    //     //  根据当前点击的按钮的索引 让对应的内容区显示  并且按钮自己也要高亮切换
    //         for (var i = 0; i < tabBtns.length; i++) {
    //             tabBtns[i].index = i;
    //             tabBtns[i].onclick = function () {
    //                 console.log(this.index);
    //             //  排它的逻辑实现功能 先让按钮集合与内容区集合 取消active类名
    //                 for (var j = 0; j < tabBtns.length; j++) {
    //                     tabBtns[j].className = '';
    //                     tabContents[j].className = ''
    //                 }
    //                 this.className = 'active';
    //             //  用当前this的索引  去内容区集合当中 访问对应的那一个 显示出来
    //                 tabContents[this.index].className = 'active';
    //             }
    //         }
    //     }
    //  封装tab切换的构造函数
    function Tab(tabBtns, tabContents) {
        this.tabBtns = tabBtns;
        this.tabContents = tabContents;
        var _this = this;
        for (var i = 0; i < this.tabBtns.length; i++) {
            this.tabBtns[i].index = i;
            this.tabBtns[i].onclick = function () {
                //  我们现在要将 实际的切换逻辑 写在原型对象的一个方法上
                //  事件回调函数的内部 this指向事件源 事件源不可能可以调用原型对象上的方法
                //  原型对象的方法  要使用实例化对象来调用  当前不是构造函数的  作用域
                //  我们只能改名  内部才能访问外部的this
                _this.clickTab(this);
            }
        }
    }
    //形参btn：在调用原型方法的位置（其实就是事件回调函数当中） 将this作为实参传递给clickTab方法
    Tab.prototype.clickTab = function (btn) {
        //  当前作用域的this是谁？   当前调用该方法的实例化对象
        for (var i = 0; i < this.tabBtns.length; i++) {
            this.tabBtns[i].className = '';
            this.tabContents[i].className = '';
        }
        btn.className = 'active';
        this.tabContents[btn.index].className = 'active';
    }

    //  侧边栏tab切换
    asideTab();
    function asideTab() {
        //  获取按钮集合
        var tabBtns = document.querySelectorAll('.wrap .mainCon .detail > aside .tabBtns > h4');
        //  获取内容区集合
        var tabContents = document.querySelectorAll('.wrap .mainCon .detail > aside .tabContents > div');
        //  我们现在希望有一个构造函数来帮我们实现tab切换功能
        var t1 = new Tab(tabBtns, tabContents);
    }
    //  商品详情tab切换
    introTab();
    function introTab() {
        //  获取按钮集合
        var tabBtns = document.querySelectorAll('.wrap .mainCon .detail .detailWrap .intro .tabBtns > li')
        //  获取内容区集合
        var tabContents = document.querySelectorAll('.wrap .mainCon .detail .detailWrap .intro .tabContents > div')
        var t2 = new Tab(tabBtns, tabContents);
    }
    //  选择搭配
    fitting();
    function fitting() {

        //  获取复选框集合
        var checkNodes = document.querySelectorAll('.wrap .mainCon .detail .detailWrap .fitting .goods .list > li input');
        //  获取商品现价标签
        var masterPNode = document.querySelector('.wrap .mainCon .detail .detailWrap .fitting .goods .master > p')
        //  获取商品套餐价标签
        var resultPNode = document.querySelector('.wrap .mainCon .detail .detailWrap .fitting .goods .result > p')
        //  获取已购商品数量标签
        var resultDiv = document.querySelector('.wrap .mainCon .detail .detailWrap .fitting .goods .result > div')
        //  给复选框循环事件绑定 然后每当复选框被点击时   遍历复选框集合
        //  将所有选中的复选框的value 和 商品的现价加在一起  即为套餐价

        for (var i = 0; i < checkNodes.length; i++) {
            checkNodes[i].onclick = function () {
                //  定义统计商品数量变量
                var num = 1;
                //  获取商品现价
                //  因为商品现价是会随着修改筛选条件而发生改变的 所以我们再要每一次点击复选框的时候 获取最新的
                var price = masterPNode.innerHTML.substr(1) * 1;
                //  遍历复选框集合 只要当前的复选框checked属性为true 则获取其value 和 现价（price）相加
                for (var j = 0; j < checkNodes.length; j++) {
                    if (checkNodes[j].checked) {
                        price += checkNodes[j].value * 1;
                        num++;
                    }
                }
                // console.log(price);
                resultPNode.innerHTML = '¥' + price;
                resultDiv.innerHTML = '已购' + num + '件商品'
            }

        }


    }

}