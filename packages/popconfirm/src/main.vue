<template>
  <el-popover
    v-bind="$attrs"
    v-model="visible"
    :title="title"
    trigger="click"
  >
  <div class="el-popconfirm">
    <p class="el-popconfirm__main" v-if="text">
    <i
      v-if="!hideIcon"
      :class="icon"
      class="el-popconfirm__icon"
      :style="{color: iconColor}"
    ></i>
      {{ text }}
    </p>
    <div class="el-popconfirm__action">
      <el-button
        :size="cancelButtonSize"
        :type="cancelButtonType"
        @click="cancel"
      >
        {{cancelButtonText}}
      </el-button>
      <el-button
        :size="confirmButtonSize"
        :type="confirmButtonType"
        @click="confirm"
      >
        {{confirmButtonText}}
      </el-button>
    </div>
  </div>
  <slot name="reference" slot="reference"></slot>
</el-popover>
</template>

<script>
import ElPopover from 'exarcheia-element/packages/popover';
import ElButton from 'exarcheia-element/packages/button';
import {t} from 'exarcheia-element/src/locale';

export default {
  name: 'ElPopconfirm',
  props: {
    title: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    confirmButtonText: {
      type: String,
      default: t('el.popconfirm.confirmButtonText')
    },
    cancelButtonText: {
      type: String,
      default: t('el.popconfirm.cancelButtonText')
    },
    confirmButtonType: {
      type: String,
      default: 'primary'
    },
    cancelButtonType: {
      type: String,
      default: 'text'
    },
    confirmButtonSize: {
      type: String,
      default: 'mini'
    },
    cancelButtonSize: {
      type: String,
      default: 'mini'
    },
    icon: {
      type: String,
      default: 'el-icon-question'
    },
    iconColor: {
      type: String,
      default: '#f90'
    },
    hideIcon: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ElPopover,
    ElButton
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    confirm() {
      this.visible = false;
      this.$emit('onConfirm');
    },
    cancel() {
      this.visible = false;
      this.$emit('onCancel');
    }
  }
};
</script>
