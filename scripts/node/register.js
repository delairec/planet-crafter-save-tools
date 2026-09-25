// fallow-ignore-file coverage-gaps -- loaded by node --import in the processes the node:* command specs spawn, which no static import reaches
import {register} from 'node:module';

register('./hooks.js', import.meta.url);
