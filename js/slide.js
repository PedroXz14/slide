export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distance = { startX: 0, finalPosition: 0, movement: 0 };
  }

  updatePosition(clientX) {
    this.distance.movement = (this.distance.startX - clientX) * 1.6;
    return this.distance.finalPosition - this.distance.movement;
  }

  moveSlide(distanceX) {
    this.distance.movePosition = distanceX;
    this.slide.style.transform = `translate3d(${distanceX}px, 0, 0)`;
  }

  onStart(e) {
    let moveType;

    if (e.type === "mousedown") {
      e.preventDefault();
      this.distance.startX = e.clientX;
      moveType = "mousemove";
    } else {
      this.distance.startX = e.changedTouches[0].clientX;
      moveType = "touchmove";
    }

    this.wrapper.addEventListener(moveType, this.onMove);
  }

  onMove(e) {
    const pointerPosition =
      e.type === "mousemove" ? e.clientX : e.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  removeEvents(e) {
    const moveType = e.type === "mouseup" ? "mousemove" : "touchstart";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.distance.finalPosition = this.distance.movePosition;
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.removeEvents);
    this.wrapper.addEventListener("touchend", this.removeEvents);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.removeEvents = this.removeEvents.bind(this);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}
