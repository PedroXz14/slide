import debounce from "./debounce.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.distance = { startX: 0, finalPosition: 0, movement: 0 };
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform 0.3s ease-out" : "";
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
    this.transition(false);
  }

  onMove(e) {
    const pointerPosition =
      e.type === "mousemove" ? e.clientX : e.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  onEnd(e) {
    const moveType = e.type === "mouseup" ? "mousemove" : "touchstart";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.distance.finalPosition = this.distance.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.distance.movement > 120 && this.index.next !== undefined) {
      this.nextSlide();
    } else if (this.distance.movement < -120 && this.index.prev !== undefined) {
      this.prevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  changeActiveClass() {
    this.slideArray.forEach((item) => item.element.classList.remove("active"));
    this.slideArray[this.index.active].element.classList.add("active");
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.distance.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
    window.addEventListener("resize", this.onResize);
  }

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { element, position };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  prevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  nextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.prevSlide = this.prevSlide.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    this.transition(true);
    this.changeSlide(0);
    return this;
  }
}

export class SlideNav extends Slide {
  constructor(...args) {
    super(...args);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener("click", this.prevSlide);
    this.nextElement.addEventListener("click", this.nextSlide);
  }

  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";

    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}"></a></li>`;
    });

    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  activeControlItem() {
    this.controlArray.forEach((item) => item.classList.remove("active"));
    this.controlArray[this.index.active].classList.add("active");
  }

  addControl(customControl) {
    this.control =
      document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
