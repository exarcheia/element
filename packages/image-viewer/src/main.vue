<template>
  <transition name="viewer-fade">
    <div tabindex="-1" ref="el-image-viewer__wrapper" class="el-image-viewer__wrapper" :style="{ 'z-index': zIndex }">
      <div class="el-image-viewer__mask"/>
      <!-- CLOSE -->
      <button class="el-image-viewer__btn el-image-viewer__close" @click="hide">
        <i class="el-icon-circle-close"/>
      </button>
      <!-- ARROW -->
      <template v-if="!isSingle">
        <button
            class="el-image-viewer__btn el-image-viewer__prev"
            :class="{ 'is-disabled': !infinite && isFirst }"
            @click="prev">
          <i class="el-icon-arrow-left"/>
        </button>
        <button
            class="el-image-viewer__btn el-image-viewer__next"
            :class="{ 'is-disabled': !infinite && isLast }"
            @click="next">
          <i class="el-icon-arrow-right"/>
        </button>
      </template>
      <!-- ACTIONS -->
      <div class="el-image-viewer__btn el-image-viewer__actions">
        <div class="el-image-viewer__actions__inner">
          <button @click="handleActions('zoomOut')"><i class="el-icon-zoom-out"/></button>
          <button @click="handleActions('zoomIn')"><i class="el-icon-zoom-in"/></button>
          <i class="el-image-viewer__actions__divider"/>
          <button @click="toggleMode"><i :class="mode.icon"/></button>
          <i class="el-image-viewer__actions__divider"></i>
          <button @click="handleActions('anticlocelise')"><i class="el-icon-refresh-left"/></button>
          <button @click="handleActions('clocelise')"><i class="el-icon-refresh-right"/></button>
        </div>
      </div>
      <!-- CANVAS -->
      <div class="el-image-viewer__canvas">
        <picture
            v-for="(image, i) in mappedUrlList"
            v-if="i === index" :key="i"
            ref="picture"
            :style="pictureStyle"
            @mousedown="handleMouseDown"
        >
          <source v-if="isWebp" :srcset="currentImg.webp" type="image/webp"/>
          <img
              class="el-image-viewer__img"
              alt="preview"
              ref="img"
              :style="imgStyle"
              :src="currentImg.original"
              @load="handleImgLoad"
              @error="handleImgError"
          />
        </picture>
      </div>
    </div>
  </transition>
</template>

<script>
import {off, on} from '../../../src/utils/dom';
import {isFirefox, rafThrottle} from '../../../src/utils/util';

const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: 'el-icon-full-screen'
  },
  ORIGINAL: {
    name: 'original',
    icon: 'el-icon-c-scale-to-original'
  }
};

const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel';

export default {
  name: 'elImageViewer',

  props: {
    urlList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    onSwitch: {
      type: Function,
      default: () => {
      }
    },
    onClose: {
      type: Function,
      default: () => {
      }
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      index: this.initialIndex,
      isShow: false,
      infinite: true,
      loading: false,
      mode: Mode.CONTAIN,
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    };
  },
  computed: {
    mappedUrlList() {
      return this.urlList.map(item => typeof item === 'object' ? item : {
        webp: false,
        original: item
      });
    },
    isWebp() {
      return Boolean(this.currentImg.webp);
    },
    isSingle() {
      return this.mappedUrlList.length <= 1;
    },
    isFirst() {
      return this.index === 0;
    },
    isLast() {
      return this.index === this.mappedUrlList.length - 1;
    },
    currentImg() {
      return this.mappedUrlList[this.index];
    },
    pictureStyle() {
      const {scale, deg, offsetX, offsetY, enableTransition} = this.transform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`
      };

      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '100%';
      }

      return style;
    },
    imgStyle() {
      return this.mode === Mode.CONTAIN ? {
        maxWidth: '100vw',
        maxHeight: '100vh'
      } : {};
    }
  },
  watch: {
    index: {
      handler: function(val) {
        this.reset();
        this.onSwitch(val);
      }
    },
    currentImg() {
      this.$nextTick(_ => {
        const $img = this.$refs.img[0];
        if (!$img.complete) {
          this.loading = true;
        }
      });
    }
  },
  methods: {
    hide() {
      this.removeTouchStartForImg();
      this.deviceSupportUninstall();
      this.onClose();
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle(e => {
        const keyCode = e.keyCode;
        switch (keyCode) {
          // ESC
          case 27:
            this.hide();
            break;
            // SPACE
          case 32:
            this.toggleMode();
            break;
            // LEFT_ARROW
          case 37:
            this.prev();
            break;
            // UP_ARROW
          case 38:
            this.handleActions('zoomIn');
            break;
            // RIGHT_ARROW
          case 39:
            this.next();
            break;
            // DOWN_ARROW
          case 40:
            this.handleActions('zoomOut');
            break;
        }
      });
      this._mouseWheelHandler = rafThrottle(e => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta > 0) {
          this.handleActions('zoomIn', {
            zoomRate: 0.015,
            enableTransition: false
          });
        } else {
          this.handleActions('zoomOut', {
            zoomRate: 0.015,
            enableTransition: false
          });
        }
      });
      on(document, 'keydown', this._keyDownHandler);
      on(document, mousewheelEventName, this._mouseWheelHandler);
    },
    deviceSupportUninstall() {
      off(document, 'keydown', this._keyDownHandler);
      off(document, mousewheelEventName, this._mouseWheelHandler);
      this._keyDownHandler = null;
      this._mouseWheelHandler = null;
    },
    handleImgLoad() {
      this.loading = false;
    },
    handleImgError(e) {
      this.loading = false;
      e.target.alt = 'Not found';
    },
    getPageXFromEvent(e) {
      return ['mousedown', 'mousemove'].includes(e.type) ? e.pageX : e.changedTouches[0].pageX;
    },
    getPageYFromEvent(e) {
      return ['mousedown', 'mousemove'].includes(e.type) ? e.pageY : e.changedTouches[0].pageY;
    },
    handleMouseDown(e) {
      if (this.loading || (e.button !== 0 && e.type === 'mousedown')) return;

      const {offsetX, offsetY} = this.transform;
      const startX = this.getPageXFromEvent(e);
      const startY = this.getPageYFromEvent(e);

      this._dragHandler = rafThrottle(ev => {
        this.transform.offsetX = offsetX + this.getPageXFromEvent(ev) - startX;
        this.transform.offsetY = offsetY + this.getPageYFromEvent(ev) - startY;
      });

      on(document, 'touchmove', this._dragHandler);
      on(document, 'touchend', () => {
        off(document, 'touchmove', this._dragHandler);
      });

      on(document, 'mousemove', this._dragHandler);
      on(document, 'mouseup', () => {
        off(document, 'mousemove', this._dragHandler);
      });

      e.preventDefault();
    },
    addTouchStartForImg() {
      this.$nextTick(() => {
        this.$refs.picture[0].addEventListener('touchstart', this.handleMouseDown);
      });
    },
    removeTouchStartForImg() {
      this.$nextTick(() => {
        this.$refs.picture[0].removeEventListener('touchstart', this.handleMouseDown);
      });
    },
    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      };
    },
    toggleMode() {
      if (this.loading) return;

      const modeNames = Object.keys(Mode);
      const modeValues = Object.values(Mode);
      const index = modeValues.indexOf(this.mode);
      const nextIndex = (index + 1) % modeNames.length;
      this.mode = Mode[modeNames[nextIndex]];
      this.reset();
    },
    prev() {
      if (this.isFirst && !this.infinite) return;
      this.removeTouchStartForImg();

      const len = this.mappedUrlList.length;
      this.index = (this.index - 1 + len) % len;

      this.addTouchStartForImg();
    },
    next() {
      if (this.isLast && !this.infinite) return;
      this.removeTouchStartForImg();

      const len = this.mappedUrlList.length;
      this.index = (this.index + 1) % len;

      this.addTouchStartForImg();
    },
    handleActions(action, options = {}) {
      if (this.loading) return;
      const {zoomRate, rotateDeg, enableTransition} = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      };
      const {transform} = this;
      switch (action) {
        case 'zoomOut':
          if (transform.scale > 0.2) {
            transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
          }
          break;
        case 'zoomIn':
          transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
          break;
        case 'clocelise':
          transform.deg += rotateDeg;
          break;
        case 'anticlocelise':
          transform.deg -= rotateDeg;
          break;
      }
      transform.enableTransition = enableTransition;
    }
  },
  mounted() {
    this.deviceSupportInstall();
    // add tabindex then wrapper can be focusable via Javascript
    // focus wrapper so arrow key can't cause inner scroll behavior underneath
    this.$refs['el-image-viewer__wrapper'].focus();

    this.addTouchStartForImg();
  }
};
</script>
