var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { K8sApi } from './k8s-api.mjs';
import { K8sManifest } from './k8s-manifest.mjs';
class K8sClient {
    constructor(parsedYaml) {
        this._api = new K8sApi(parsedYaml);
        this._manifest = new K8sManifest(parsedYaml);
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._api.create(this._manifest);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._api.delete(this._manifest);
        });
    }
    toString() {
        return this._manifest.toString();
    }
}
export { K8sClient };
