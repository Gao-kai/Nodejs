class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  isEmpty() {
    return this.head === null;
  }

  append(value) {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let lastNode = this.head;
    while (lastNode.next) {
      lastNode = lastNode.next;
    }
    lastNode.next = newNode;
  }

  prepend(value) {
    const newNode = new ListNode(value, this.head);
    this.head = newNode;
  }

  delete(value) {
    if (!this.head) {
      return;
    }

    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }

    let currentNode = this.head;
    while (currentNode.next && currentNode.next.value !== value) {
      currentNode = currentNode.next;
    }

    if (currentNode.next) {
      currentNode.next = currentNode.next.next;
    }
  }

  display() {
    let currentNode = this.head;
    while (currentNode) {
      console.log(currentNode.value + " -> ");
      currentNode = currentNode.next;
    }
    console.log("null");
  }
}
