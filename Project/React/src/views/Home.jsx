import React, { Component } from "react";
import fastclick from "fastclick";
console.log({ fastclick });

fastclick.attach(document.body);

export default class Home extends Component {
  timer = null;

  constructor() {
    super();
    this.state = {};
  }

  liClick = (e) => {
    console.log(e);
  };

  render() {
    console.log("render函数执行");
    return (
      <>
        <ul>
          {[1, 2, 3].map((item, index) => {
            return <li onClick={this.liClick}>{item}</li>;
          })}
        </ul>

        <div id="pc" onClick={this.click} onDoubleClickCapture={this.dbClick}>
          PC端点击事件
        </div>

        <div
          id="mobile"
          onClick={this.mClick}
          onDoubleClickCapture={this.mDbClick}
        >
          移动端点击事件
        </div>

        <div
          style={{ height: "100px", width: "100px", background: "pink" }}
          id="touch"
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
        >
          模拟手指事件模型解决Click延迟
        </div>

        <div
          id="fastclick"
          onClick={this.mClick}
          onDoubleClickCapture={this.mDbClick}
        >
          fastclick解决Click延迟
        </div>
      </>
    );
  }

  /**
   * 开始触摸到屏幕 此时记录手指在屏幕的位置x和y
   * 然后
   * @param {*} e
   */
  onTouchStart = (e) => {
    const fingerInfo = e.changedTouches[0];
    const { pageX, pageY } = fingerInfo;
    this.touchStatus = {
      startX: pageX,
      startY: pageY,
      isMove: false,
    };
  };

  /**
   * 手指移动
   * @param {*} e
   */
  onTouchMove = (e) => {
    console.log(e);
    const fingerInfo = e.changedTouches[0];
    const { pageX, pageY } = fingerInfo;
    const { startX, startY } = this.touchStatus;
    if (Math.abs(pageX - startX) >= 10 || Math.abs(pageY - startY) >= 10) {
      this.touchStatus.isMove = true;
    }
  };

  /**
   * 触摸结束
   * @param {} e
   */
  onTouchEnd = (e) => {
    if (this.touchStatus.isMove) return;
    // 这里执行原本写在点击事件handleClick处理函数中的代码
    console.log("这是点击事件");
  };

  mClick = (e) => {
    console.log("移动端点击", e);
  };

  mDbClick = () => {
    console.log("移动端双击");
  };

  click = (e) => {
    console.log("点击一次", this.timer);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      console.log("单击触发");
    }, 300);
  };

  dbClick = (e) => {
    console.log("点击二次", this.timer);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log("双击触发");
  };
}
