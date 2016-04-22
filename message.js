"use strict";

class Message {
  /**
   * @param {string} type - "success", "info", "warn", "error"
   * @param {string} message - 表示するメッセージ
   * @param {number} time - 表示する時間(ms) 0なら自動的に閉じない
   */
  constructor(type, message, time) {
    this.type = type;
    this.message = message;
    this.time = time || 0;
    this.id = `message-dialog-${Date.now()}`;
  }
  
  /**
   * typeに応じたclass名を返す
   * @returns {string}
   */
  get className() {
    switch(this.type) {
      case "success":
        return "alert-success";
      case "info":
        return "alert-info";
      case "warn":
        return "alert-warning";
      case "error":
        return "alert-danger"
      default:
        return "alert-warning";
    }
  }
  
  /**
   * typeに応じたアイコンを返す
   * @returns {string}
   */
  get icon() {
    switch(this.type) {
      case "success": // (v)
        return `<span class="glyphicon glyphicon-ok-sign"></span>`;
      case "info": // (i)
        return `<span class="glyphicon glyphicon-info-sign"></span>`;
      case "warn": // (!)
        return `<span class="glyphicon glyphicon-exclamation-sign"></span>`;
      case "error": // (x)
        return `<span class="glyphicon glyphicon-remove-sign"></span>`;
      default:
        return "";
    }
  }
  
  /**
   * アラートを表示する
   */
  show() {
    $("#message-area").append(
      `<div id="${this.id}" class="alert ${this.className} alert-dismissible fade in" role="alert">
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  ${this.icon} ${this.message}
</div>`
    );
    
    if (this.time > 0) {
      setTimeout(() => {
        $(`#${this.id}`).alert("close");
      }, this.time);
    }
  }
}

module.exports = Message;
