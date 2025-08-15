import { h, defineComponent, ref } from 'vue';
import { VBtn } from 'vuetify/components';
import RedenRouter from '~/components/RedenRouter.vue';

const AuthorLink = defineComponent<{
  username: string;
  source: 'self' | 'minemev';
}>({
  setup(props) {
    //   return () => (
    //
    //     <RedenRouter
    //       v-if="selected.author"
    //                 :to="
    //   selected.source === 'minemev'
    //     ? `https://minemev.com/u/${selected.author.username}`
    //     : localePath(`/@${selected.author.username}`)
    //   "
    //   class="d-flex flex-row router"
    //   style="line-height: 32px"
    //     >
    //     <v-avatar v-if="selected.author.avatarUrl" size="32">
    //     <v-img :src="selected.author.avatarUrl" />
    //     </v-avatar>
    //   {{ selected.author.username }}
    // </RedenRouter>
    //   );
  },
});
