import { h, defineComponent, ref } from 'vue';
import { VBtn } from 'vuetify/components';

interface CounterProps {
  initialCount?: number;
}

// 创建一个简单的计数器组件
const Counter = defineComponent<CounterProps>({
  props: {
    initialCount: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const count = ref(props.initialCount!);

    const increment = () => {
      count.value++;
    };

    const decrement = () => {
      count.value--;
    };

    return () => (
      <div class="counter-component">
        <h3>计数器: {count.value}</h3>
        <div class="counter-buttons">
          <VBtn onClick={increment} class="increment-btn" color="primary">
            增加
          </VBtn>
          <VBtn onClick={decrement} class="decrement-btn">
            减少
          </VBtn>
        </div>
      </div>
    );
  },
});

// 主页面组件
export default defineComponent({
  setup() {
    const title = ref('TSX 示例页面');
    const description = ref('这是一个使用 TSX 语法创建的 Nuxt 页面');
    const items = ref([
      { id: 1, text: '学习 TSX 语法' },
      { id: 2, text: '在 Nuxt 中集成 TSX' },
      { id: 3, text: '创建复杂组件' },
    ]);

    return () => (
      <div class="tsx-demo-page">
        <h1>{title.value}</h1>
        <p>{description.value}</p>

        <div class="features-section">
          <h2>功能列表</h2>
          <ul>
            {items.value.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </div>

        <div class="counter-section">
          <h2>TSX 计数器组件</h2>
          <Counter initialCount={10} />
          <Counter initialCount={5} />
        </div>

        <div class="info-section">
          <h2>关于 TSX</h2>
          <p>
            TSX 是 TypeScript 的 JSX 扩展，允许您在 TypeScript 中使用类似 JSX
            的语法。
          </p>
          <p>
            在 Vue 3 中，您可以使用 TSX
            作为模板的替代方案，特别适合需要更复杂逻辑的组件。
          </p>
        </div>
      </div>
    );
  },
});
