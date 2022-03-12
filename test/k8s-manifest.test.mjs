import chai from 'chai';
const expect = chai.expect;

import {K8sManifest} from '../src/k8s-manifest.mjs';

describe('k8s-manifest', () => {

    it('should throw an error if an unknown key is supplied', () => {
        const parsedYaml = {
            unknownKey: 'this is unknown',
            kind: 'CronJob'
        };
        expect(new K8sManifest(parsedYaml)).to.throw();
    })

    it('should correctly map CronJob to a k8s client object', () => {

    })

    it('should correctly map Job to a k8s client object', () => {

    })

    it('should correctly map Service to a k8s client object', () => {

    })

    it('should correctly map Deployment to a k8s client object', () => {

    })

    it('should correctly map Secret to a k8s client object', () => {

    })

    it('should correctly map ConfigMap to a k8s client object', () => {

    })

    it('should correctly map PersistentVolume to a k8s client object', () => {

    })

    describe('_k8sClientObject', () => {

        it('should throw an error if an unknown key is supplied', () => {


        })
    })
})