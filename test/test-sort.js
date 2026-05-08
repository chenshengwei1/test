class SortHandler extends TestPartHanlder{
    constructor(){
        super();
        this.id = 'sort';
        this.title = 'sort';
        this.name = 'sort';
    }

    getStyle(){
        return `.num-item {
                    padding-right: 2px;
                    background-color: antiquewhite;
                    margin-left: 3px;
                }

                .itemlist {
                    display: flex;
                    flex-wrap: wrap;
                }

                .cost-time {
                    color: red;
                }

                .num-list-display .num-item {
                    width: 100%;
                }`;
    }

    getBody(){
        return `
				<style>
                    ${this.getStyle()}
				</style>
				<div active="false" class="sort-root-container">
                    <input id="numberLength" type="number" value="8" min="1" max="10" />
                    <button class="sort-btn" data-count="1000">click 1000</button>
                    <button class="sort-btn" data-count="10000">click 10000</button>
                    <button class="sort-btn" data-count="100000">click 100000</button>
                    <button class="sort-btn" data-count="1000000">click 1000000</button>
                    <button class="sort-btn" data-count="10000000">click 10000000</button>
                    <span>cost time: <span class="cost-time">0</span></span>
                    <button class="showlistnumber" onclick="radomUtil.showlistnumber()">show list</button>
                    <button class="sort" onclick="radomUtil.callSort('sort1')">sort1</button>

                    <button class="sort-btn-method" data-method="bubble">冒泡</button>
                    <button class="sort-btn-method choose" data-method="choose">选择</button>
                    <button class="sort-btn-method insert" data-method="insert">插入</button>
                    <button class="sort-btn-method merge" data-method="merge">归并</button>
                    <button class="sort-btn-method hill" data-method="hill">希尔</button>


                    <div class="itemlist" style="display:flex;">
                    </div>
			</div>
			`
    }

    addListner(){
        const radomUtil = new RadomUtil(100);
        $(this.dom, '.sort-root-container .sort-btn').on('click', (event)=>{
            let dataCount = event.target.data.get('count');
            radomUtil.start(+dataCount);
        })
        $(this.dom, '.sort-root-container .sort-btn-method').on('click', (event)=>{
            let method = $(event.target).attr('data-method');
            radomUtil.callSort(method);
        })
    }
}

class RadomUtil {
    numberLength = 8;
    allNumbers = [];
    sortMap = {};
    numberCount = 1000;

    constructor(n) {
        this.numberCount = n;
        this.sortMap.sort1 = this.sort1;
        this.sortMap.bubble = this.bubble;
        this.sortMap.choose = this.choose;
        this.sortMap.insert = this.insert;
        this.sortMap.merge = this.merge;
        this.sortMap.hill = this.hill;
    }

    start(n) {
        this.numberCount = n;
        this.numberLength = $('#numberLength').val();
        this.numberLength = Number(this.numberLength);
        $('.cost-time').html('loading...');
        setTimeout(() => {
            let timeStart = Date.now();
            this.allNumbers = this.generateRadomNumber(this.numberCount);
            this.show(this.allNumbers);
            $('.cost-time').html(Date.now() - timeStart);
        })
    }

    get dom(){
        return $('div.'+this.id);
    }

    showlistnumber() {
        if ($(this.dom, '.itemlist').is('.num-list-display')) {
            $(this.dom,'.itemlist').removeClass('num-list-display');
            $(this.dom,'.showlistnumber').html('Show List');
        } else {
            $(this.dom,'.itemlist').addClass('num-list-display');
            $(this.dom,'.showlistnumber').html('Show Warp');
        }
    }

    generateRadomNumber(n, m) {
        let numberList = [];
        for (let i = 0; i < (n || 10); i++) {
            numberList.push(this.getRandom(m || this.numberLength));
        }
        return numberList;
    }

    getRandom(i) {
        return Math.floor(Math.random() * Math.pow(10, i));
    }

    show(items) {
        let conent = '<span class="num-item">' + items.join('</span><span class="num-item">') + '</span>';
        $(this.dom,'.sort .itemlist').html(conent)
    }



    callSort(name) {
        let s = this.sortMap[name];
        $(this.dom,'.cost-time').html('loading...');
        setTimeout(() => {
            let timeStart = Date.now();
            let items = s.call(this, this.allNumbers);
            //let items = s && s(this.allNumbers);
            let timeMiddle = Date.now();
            this.show(items);
            $('.cost-time').html('sort time:' + (timeMiddle - timeStart) + ' - show time:' + (Date.now() - timeMiddle));
        })

    }

    less(a, b) {
        return Number(a) < Number(b);
    }
    lessOrEqual(a, b) {
        return Number(a) <= Number(b);
    }

    sort1(p) {
        let items = p.concat([]);
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (less(items[j], items[i])) {
                    let t = items[j];
                    items[j] = items[i];
                    items[i] = t;
                }
            }
        }
        return items;
    }

    insert(p) {
        p = p || this.allNumbers;
        let items = p.concat([]);
        let len = items.length;
        let preIndex, current;
        for (let i = 1; i < len; i++) {
            preIndex = i - 1;
            current = items[i];
            while (preIndex >= 0 && less(current, items[preIndex])) {
                items[preIndex + 1] = items[preIndex];
                preIndex--;
            }
            items[preIndex + 1] = current;
        }
        return items;
    }

    merge(p) {
        p = p || this.allNumbers;
        let items = p.concat([]);
        let len = items.length;
        if (len < 2) {
            return items;
        }
        var middle = Math.floor(len / 2),
            left = items.slice(0, middle),
            right = items.slice(middle);
        return this.merge1(this.merge(left), this.merge(right));
    }

    merge1(left, right) {
        var result = [];
        while (left.length && right.length) {
            if (this.lessOrEqual(left[0], right[0])) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        while (left.length)
            result.push(left.shift());

        while (right.length)
            result.push(right.shift());

        return result;
    }

    hill(p) {
        p = p || this.allNumbers;
        let items = p.concat([]);
        let len = items.length,
            temp, gap = 1;
        while (gap < len / 1) {          //动态定义间隔序列
            gap = gap * 3 + 1;
        }
        for (gap; gap > 0; gap = Math.floor(gap / 3)) {
            for (let i = gap; i < len; i++) {
                temp = items[i];
                let t = 0;
                for (let j = i - gap; j >= 0 && less(temp, items[j]); j -= gap) {
                    items[j + gap] = items[j];
                    t = j + gap;
                }
                items[t] = temp;
            }
        }
        return items;
    }

    choose(p) {
        p = p || this.allNumbers;

        let items = p.concat([]);
        let minIndex = 0;
        let temp = 0;
        for (let i = 0; i < items.length - 1; i++) {
            minIndex = i;

            for (let j = i + 1; j < items.length - 1; j++) {
                if (less(items[j], items[minIndex])) {
                    minIndex = j;
                }
            }
            temp = items[i];
            items[i] = items[minIndex];
            items[minIndex] = temp;

        }
        return items;
    }

    bubble(p) {
        p = p || this.allNumbers;
        let items = p.concat([]);
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (less(items[j], items[i])) {
                    let t = items[j];
                    items[j] = items[i];
                    items[i] = t;
                }
            }
        }
        return items;
    }

}
