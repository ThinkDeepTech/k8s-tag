import yaml from "yaml";
import k8s from "@kubernetes/client-node";

class K8sManifest {
    constructor(parsedYaml) {

        if (!parsedYaml || !parsedYaml.kind)
            throw new Error(`The parsed yaml couldn't be used to construct a k8s object.\n${yaml.stringify(parsedYaml)}`);

        this._fieldMap = {
            'persistentvolume': (value) => {
                const subject = new k8s.V1PersistentVolume();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec', 'status']);

                subject['spec'] = this._k8sClientObject('persistentvolume:spec', value['spec']);
                subject['status'] = this._k8sClientObject('persistentvolume:spec', value['status']);

                return subject;
            },
            'persistentvolume:spec': (value) => {
                const subject = new k8s.V1PersistentVolumeSpec();

                subject.accessModes = this._k8sClientObject('type:array');
                subject.awsElasticBlockStore = this._k8sClientObject('aws:elastic:block:store', value['awsElasticBlockStore']);
                subject.azureDisk = this._k8sClientObject('azure:disk', value['azureDisk']);
                subject.azureFile = this._k8sClientObject('azure:file', value['azureFile']);
                subject.capacity = this._k8sClientObject('type:map', value['capacity']);
                subject.cephfs = this._k8sClientObject('cephfs', value['cephfs']);
                subject.cinder = this._k8sClientObject('cinder', value['cinder']);
                subject.claimRef = this._k8sClientObject('claimref', value['claimRef']);
                subject.csi = this._k8sClientObject('csi', value['csi']);
                subject.fc = this._k8sClientObject('fc', value['fc']);
                subject.flexVolume = this._k8sClientObject('flexvolume', value['flexVolume']);
                subject.flocker = this._k8sClientObject('flocker', value['flocker']);
                subject.gcePersistentDisk = this._k8sClientObject('gce:persistent:disk', value['gcePersistentDisk']);
                subject.glusterfs = this._k8sClientObject('glusterfs', value['glusterfs']);
                subject.hostPath = this._k8sClientObject('hostpath', value['hostPath']);
                subject.iscsi = this._k8sClientObject('iscsi', value['iscsi']);
                subject.local = this._k8sClientObject('local:volume:store', value['local']);
                subject.mountOptions = this._k8sClientObject('type:array', value['mountOptions']);
                subject.nfs = this._k8sClientObject('nfs', value['nfs']);
                subject.nodeAffinity = this._k8sClientObject('nodeaffinity', value['nodeAffinity']);
                subject.persistentVolumeReclaimPolicy = this._k8sClientObject('persistentvolumereclaimpolicy', value['persistentVolumeReclaimPolicy']);
                subject.photonPersistentDisk = this._k8sClientObject('photon:persistent:disk', value['photonPersistentDisk']);
                subject.portworxVolume = this._k8sClientObject('portworxvolume', value['portworxVolume']);
                subject.quobyte = this._k8sClientObject('quobyte', value['quobyte']);
                subject.rbd = this._k8sClientObject('rbd', value['rbd']);
                subject.scaleIO = this._k8sClientObject('scaleio', value['scaleIO']);
                subject.storageClassName = this._k8sClientObject('storageclassname', value['storageClassName']);
                subject.storageos = this._k8sClientObject('storageos', value['storageos']);
                subject.volumeMode = this._k8sClientObject('volumemode', value['volumeMode']);
                subject.vsphereVolume = this._k8sClientObject('vspherevolume', value['vsphereVolume']);

                return subject;
            },
            'metadata': (value) => {

                const subject = new k8s.V1ObjectMeta();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['labels', 'finalizers', 'managedFields']);

                // TODO: Implement all fields
                subject.labels = this._k8sClientObject('type:map', value['labels']);
                subject.finalizers = this._k8sClientObject('type:array', value['finalizers']);
                subject.managedFields = this._k8sClientObject('metadata:managed:fields', value['managedFields']);

                return subject;
            },
            'metadata:managed:fields': (value) => {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('metadata:managed:field', entry));
                }

                return vars;
            },
            'metadata:managed:field': (value) => {
                const subject = new k8s.V1ManagedFieldsEntry();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'namespace': (value) => {
                const subject = new k8s.V1Namespace();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec', 'status']);

                subject.spec = this._k8sClientObject('namespace:spec', value['spec']);
                subject.status = this._k8sClientObject('namespace:status', value['status']);

                return subject;
            },
            'namespace:spec': (value) => {
                const subject = new k8s.V1NamespaceSpec();

                subject.finalizers = this._k8sClientObject('type:array', value['finalizers']);

                return subject;
            },
            'namespace:status': (value) => {
                const subject = new k8s.V1NamespaceStatus();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['conditions']);

                subject['conditions'] = this._k8sClientObject('namespace:conditions', value['conditions']);

                return subject;
            },
            'namespace:conditions': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('namespace:condition', entry));
                }

                return vals;
            },
            'namespace:condition': (value) => {
                const subject = new k8s.V1NamespaceCondition();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'configmap': (value) => {
                const subject = new k8s.V1ConfigMap();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'secret': (value) => {
                const subject = new k8s.V1Secret();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'deployment': (value) => {
                const subject = new k8s.V1Deployment();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec', 'status']);

                subject.spec = this._k8sClientObject('deployment:spec', value['spec']);
                subject.status = this._k8sClientObject('deployment:status', value['status']);

                return subject;
            },
            'deployment:spec': (value) => {
                const subject = new k8s.V1DeploymentSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['selector', 'template', 'strategy']);

                subject['selector'] = this._k8sClientObject('label:selector', value['selector']);
                subject['strategy'] = this._k8sClientObject('deployment:strategy', value['strategy']);
                subject['template'] = this._k8sClientObject('pod:template', value['template']);

                return subject;
            },
            'deployment:conditions': (value) => {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('deployment:condition', entry));
                }

                return vars;
            },
            'deployment:condition': (value) => {

                const subject = new k8s.V1DeploymentCondition();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'deployment:strategy': (value) => {
                const subject = new k8s.V1DeploymentStrategy();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['rollingUpdate']);

                subject['rollingUpdate'] = this._k8sClientObject('deployment:rolling:update', value['rollingUpdate']);

                return subject;
            },
            'deployment:rolling:update': (value) => {
                const subject = new k8s.V1RollingUpdateDeployment();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'deployment:status': (value) => {
                const subject = new k8s.V1DeploymentStatus();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['conditions']);

                subject.conditions = this._k8sClientObject('deployment:conditions', value['conditions'])

                return subject;
            },
            'cronjob': (value) => {
                const subject = new k8s.V1CronJob();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('cronjob:spec', value['spec']);

                return subject;
            },
            'cronjob:spec': (value) => {

                const subject = new k8s.V1CronJobSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['jobTemplate']);

                subject.jobTemplate = this._k8sClientObject('job:template', value['jobTemplate']);

                return subject;
            },
            'job': (value) => {

                const subject = new k8s.V1Job();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('job:spec', value['spec']);

                return subject;
            },
            'job:template': (value) => {

                const subject = new k8s.V1JobTemplateSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('job:spec', value['spec']);

                return subject;
            },
            'job:spec': (value) => {

                const subject = new k8s.V1JobSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['template', 'selector']);

                subject.selector = this._k8sClientObject('label:selector', value['selector']);
                subject.template = this._k8sClientObject('pod:template', value['template']);

                return subject;
            },
            'pod': (value) => {
                const subject = new k8s.V1Pod();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('pod:spec', value['spec']);

                return subject;
            },
            'pod:template': (value) => {

                const subject = new k8s.V1PodTemplateSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec']);

                subject.spec = this._k8sClientObject('pod:spec', value['spec']);

                return subject;
            },
            'pod:spec': (value) => {

                const subject = new k8s.V1PodSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'service': (value) => {
                const subject = new k8s.V1Service();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['spec', 'status']);

                subject.spec = this._k8sClientObject('service:spec', value['spec']);
                subject.status = this._k8sClientObject('service:status', value['status']);

                return subject;
            },
            'service:spec': (value) => {
                const subject = new k8s.V1ServiceSpec();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, [
                    'ports', 'clusterIPs', 'externalIPs', 'ipFamilies', 'loadBalancerSourceRanges', 'topologyKeys',
                    'selector'
                ]);

                subject['clusterIPs'] = this._k8sClientObject('type:array', value['clusterIPs']);
                subject['externalIPs'] = this._k8sClientObject('type:array', value['externalIPs']);
                subject['ipFamilies'] = this._k8sClientObject('type:array', value['ipFamilies']);
                subject['loadBalancerSourceRanges'] = this._k8sClientObject('type:array', value['loadBalancerSourceRanges']);
                subject['selector'] = this._k8sClientObject('type:map', value['selector']);
                subject['sessionAffinityConfig'] =
                subject['topologyKeys'] = this._k8sClientObject('type:array', value['topologyKeys']);
                subject['ports'] = this._k8sClientObject('service:ports', value['ports']);

                return subject;
            },
            'service:ports': (value) => {
                let vals = [];

                for (const field in value) {
                    vals.push(this._k8sClientObject('service:port', value[field]));
                }

                return vals;
            },
            'service:port': (value) => {
                const subject = new k8s.V1ServicePort();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'service:status': (value) => {
                const subject = new k8s.V1ServiceStatus();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['loadBalancer']);

                subject.loadBalancer = this._k8sClientObject('load:balancer:status', value['loadBalancer']);

                return subject;
            },
            'load:balancer:status': (value) => {
                const subject = new k8s.V1LoadBalancerStatus();

                subject.ingress = this._k8sClientObject('load:balancer:ingress', value['ingress']);

                return subject;
            },
            'load:balancer:ingress': (value) => {
                const subject = new k8s.V1LoadBalancerIngress();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['ports']);

                subject.ports = this._k8sClientObject('ports:status', value['ports']);

                return subject;
            },
            'ports:status': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('port:status', entry));
                }

                return vals;
            },
            'port:status': (value) => {
                const subject = new k8s.V1PortStatus();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'label:selector': (value) => {
                const subject = new k8s.V1LabelSelector();

                subject['matchExpressions'] = this._k8sClientObject('label:selector:requirements', value['matchExpressions']);
                subject['matchLabels'] = this._k8sClientObject('type:map', value['matchLabels']);

                return subject;
            },
            'label:selector:requirements': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('label:selector:requirement', entry));
                }

                return vals;
            },
            'label:selector:requirement': (value) => {

                const subject = new k8s.V1LabelSelectorRequirement();

                this._runTransform(value, (field, val) => {
                    console.log(`field ${field}, val ${val}`);
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['values']);

                subject['values'] = this._k8sClientObject('type:array', value['values']);

                return subject;
            },
            'aws:elastic:block:store': (value) => {
                const subject = new k8s.V1AWSElasticBlockStoreVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'azure:disk': (value) => {
                const subject = new k8s.V1AzureDiskVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'azure:file': (value) => {
                const subject = new k8s.V1AzureFilePersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'cephfs': (value) => {
                const subject = new k8s.V1CephFSPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['monitors', 'secretRef']);

                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef']);
                subject.monitors = this._k8sClientObject('type:array', value['monitors']);

                return subject;
            },
            'cinder': (value) => {
                const subject = new k8s.V1CinderPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['secretRef']);

                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef']);

                return subject;
            },
            'claimref': (value) => {
                const subject = new k8s.V1ObjectReference();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'csi': (value) => {
                const subject = new k8s.V1CSIPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, [
                    'controllerExpandSecretRef', 'controllerPublishSecretRef', 'nodePublishSecretRef',
                    'nodeStageSecretRef', 'volumeAttributes'
                ]);

                subject.controllerExpandSecretRef = this._k8sClientObject('secret:reference', value['controllerExpandSecretRef']);
                subject.controllerPublishSecretRef = this._k8sClientObject('secret:reference', value['controllerPublishSecretRef']);
                subject.nodePublishSecretRef = this._k8sClientObject('secret:reference', value['nodePublishSecretRef']);
                subject.nodeStageSecretRef = this._k8sClientObject('secret:reference', value['nodeStageSecretRef']);
                subject.volumeAttributes = this._k8sClientObject('type:map', value['volumeAttributes']);

                return subject;
            },
            'fc': (value) => {
                const subject = new k8s.V1FCVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['targetWWNs', 'wwids']);

                subject.targetWWNs = this._k8sClientObject('type:array', value['targetWWNs']);
                subject.wwids = this._k8sClientObject('type:array', value['wwids']);

                return subject;
            },
            'flexvolume': (value) => {
                const subject = new k8s.V1FlexPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['secretRef']);

                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef']);

                return subject;
            },
            'flocker': (value) => {
                const subject = new k8s.V1FlockerVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'gce:persistent:disk': (value) => {
                const subject = new k8s.V1GCEPersistentDiskVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'photon:persistent:disk': (value) => {
                const subject = new k8s.V1PhotonPersistentDiskVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'portworxvolume': (value) => {
                const subject = new k8s.V1PortworxVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'quobyte': (value) => {
                const subject = new k8s.V1QuobyteVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'rbd': (value) => {
                const subject = new k8s.V1RBDPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['monitors', 'secretRef']);

                subject.monitors = this._k8sClientObject('type:array', value['monitors']);
                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef'])

                return subject;
            },
            'scaleio': (value) => {
                const subject = new k8s.V1ScaleIOPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['secretRef']);

                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef']);

                return subject;
            },
            'vspherevolume': (value) => {
                const subject = new k8s.V1VsphereVirtualDiskVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'storageos': (value) => {
                const subject = new k8s.V1StorageOSPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['secretRef']);

                subject.secretRef = this._k8sClientObject('object:reference', value['secretRef']);

                return subject;
            },
            'object:reference': (value) => {
                const subject = new k8s.V1ObjectReference();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'glusterfs': (value) => {
                const subject = new k8s.V1GlusterfsPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'hostpath': (value) => {
                const subject = new k8s.V1HostPathVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'iscsi': (value) => {
                const subject = new k8s.V1ISCSIPersistentVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['portals', 'secretRef']);

                subject.portals = this._k8sClientObject('type:array', value['portals']);
                subject.secretRef = this._k8sClientObject('secret:reference', value['secretRef']);

                return subject;
            },
            'local:volume:store': (value) => {
                const subject = new k8s.V1LocalVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'nfs': (value) => {
                const subject = new k8s.V1NFSVolumeSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'nodeaffinity': (value) => {
                const subject = new k8s.V1VolumeNodeAffinity();

                subject.required = this._k8sClientObject('node:selector', value['required']);

                return subject;
            },
            'node:selector': (value) => {
                const subject = new k8s.V1NodeSelector();

                subject.nodeSelectorTerms = this._k8sClientObject('node:selector:terms', value['nodeSelectorTerms']);

                return subject;
            },
            'node:selector:terms': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('node:selector:term', entry));
                }

                return vals;
            },
            'node:selector:term': (value) => {
                const subject = new k8s.V1NodeSelectorTerm();

                subject.matchExpressions = this._k8sClientObject('node:selector:requirements', value['matchExpressions']);
                subject.matchFields = this._k8sClientObject('node:selector:requirements', value['matchFields']);

                return subject;
            },
            'node:selector:requirements': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('node:selector:requirement', entry));
                }

                return vals;
            },
            'node:selector:requirement': (value) => {
                const subject = new k8s.V1NodeSelectorRequirement();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['values']);

                subject.values = this._k8sClientObject('type:array', value['values']);

                return subject;
            },
            'sessionaffinityconfig': (value) => {
                const subject = new k8s.V1SessionAffinityConfig();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'selector': (value) => {
                let subject = {};

                for (const field in value) {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }

                return subject;
            },
            'annotations': (value) => {

                let subject = {};

                for (const field in value) {
                    subject[field] = this._k8sClientObject(field, value[field]);
                }

                return subject;
            },
            'clientip': (value) => {
                const subject = new k8s.V1ClientIPConfig();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'conditions': (value) => {
                const vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('condition', entry));
                }

                return vals;
            },
            'imagepullsecrets': (value) => {

                let vals = [];
                for (const obj of value) {
                    vals.push(this._k8sClientObject('localobjectreference', obj));
                }

                return vals;
            },
            'localobjectreference': (value) => {

                const subject = new k8s.V1LocalObjectReference();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'containers': (value) => {

                let vals = [];
                for (const entry of value) {
                    vals.push(this._k8sClientObject('container', entry));
                }

                return vals
            },
            'container': (value) => {

                const subject = new k8s.V1Container();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                }, ['command', 'args', 'ports', 'livenessProbe', 'readinessProbe', 'startupProbe']);

                subject['startupProbe'] = this._k8sClientObject('probe', value['startupProbe']);
                subject['readinessProbe'] = this._k8sClientObject('probe', value['readinessProbe']);
                subject['livenessProbe'] = this._k8sClientObject('probe', value['livenessProbe']);
                subject['ports'] = this._k8sClientObject('container:ports', value['ports']);
                subject['command'] = this._k8sClientObject('type:array', value['command']);
                subject['args'] = this._k8sClientObject('type:array', value['args']);

                return subject;
            },
            'volumemounts': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('volumemount', entry));
                }

                return vals;
            },
            'volumemount': (value) => {
                const subject = new k8s.V1VolumeMount();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'volumedevices': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('volumedevice', entry));
                }

                return vals;
            },
            'volumedevice': (value) => {
                const subject = new k8s.V1VolumeDevice();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'securitycontext': (value) => {
                const subject = new k8s.V1SecurityContext();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'windowsoptions': (value) => {
                const subject = new k8s.V1WindowsSecurityContextOptions();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'seccompprofile': (value) => {
                const subject = new k8s.V1SeccompProfile();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'selinuxoptions': (value) => {
                const subject = new k8s.V1SELinuxOptions();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'capabilities': (value) => {
                const subject = new k8s.V1Capabilities();

                subject.add = this._k8sClientObject('type:array', value['add']);
                subject.drop = this._k8sClientObject('type:array', value['drop']);

                return subject;
            },
            'resources': (value) => {
                const subject = new k8s.V1ResourceRequirements();

                subject.limits = this._k8sClientObject('type:map', value['limits']);
                subject.requests = this._k8sClientObject('type:map', value['requests']);

                return subject;
            },
            'probe': (value) => {
                const subject = new k8s.V1Probe();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'lifecycle': (value) => {
                const subject = new k8s.V1Lifecycle();

                subject['postStart'] = this._k8sClientObject('handler', value['postStart']);
                subject['preStop'] = this._k8sClientObject('handler', value['preStop']);

                return subject;
            },
            'handler': (value) => {
                const subject = new k8s.V1Handler();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'tcpsocket': (value) => {
                const subject = new k8s.V1TCPSocketAction();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'envfrom': (value) => {

                let vals = [];
                for (const entry of value) {
                    const type = Object.keys(entry)[0];
                    vals.push(this._k8sClientObject(type, entry[type]));
                }

                return vals;
            },
            'configmapref': (value) => {

                const subject = new k8s.V1EnvFromSource();
                const configMap = new k8s.V1ConfigMapEnvSource();

                this._runTransform(value, (field, val) => {
                    configMap[field] = this._k8sClientObject(field, val[field]);
                });

                subject.configMapRef = configMap;

                return subject;
            },
            'secretref': (value) => {

                const subject = new k8s.V1EnvFromSource();
                const secretRef = new k8s.V1SecretEnvSource();

                this._runTransform(value, (field, val) => {
                    secretRef[field] = this._k8sClientObject(field, val[field]);
                });

                subject.secretRef = secretRef;

                return subject;
            },
            'secret:reference': (value) => {
                const subject = new k8s.V1SecretReference();

                this._runTransform(value, (field, val) => {
                    secretRef[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'creationtimestamp': (value) => {
                return Date.parse(value) || null;
            },
            'deletiontimestamp': (value) => {
                return Date.parse(value) || null;
            },
            'ownerreferences': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('ownerreference', entry));
                }

                return vals;
            },
            'ownerreference': (value) => {
                const subject = new k8s.V1OwnerReference();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'httpget': (value) => {
                const subject = new k8s.V1HTTPGetAction();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'httpheaders': (value) => {
                let vals = [];

                for (const entry of value) {
                    vals.push(this._k8sClientObject('httpheader', entry));
                }

                return vals;
            },
            'httpheader': (value) => {
                const subject = new k8s.V1HTTPHeader();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'exec': (value) => {
                const subject = new k8s.V1ExecAction();

                subject.command = this._k8sClientObject('type:array', value['command']);

                return subject;
            },
            'env': (value) => {
                const subject = new k8s.V1EnvVar();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'valuefrom': (value) => {
                const subject = new k8s.V1EnvVarSource();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'resourcefieldref': (value) => {
                const subject = new k8s.V1ResourceFieldSelector();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'fieldref': (value) => {
                const subject = new k8s.V1ObjectFieldSelector();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'configmapkeyref': (value) => {
                const subject = new k8s.V1ConfigMapKeySelector();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'container:ports': (value) => {
                let vars = [];

                for (const entry of value) {
                    vars.push(this._k8sClientObject('container:port', entry));
                }

                return vars;
            },
            'container:port': (value) => {
                const subject = new k8s.V1ContainerPort();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'secretkeyref': (value) => {
                const subject = new k8s.V1SecretKeySelector();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'condition': (value) => {
                const subject = new k8s.V1Condition();

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            },
            'data': (value) => {
                return this._k8sClientObject('type:map', value);
            },
            'binaryData': (value) => {
                return this._k8sClientObject('type:map', value);
            },
            'stringData': (value) => {
                return this._k8sClientObject('type:map', value);
            },
            'type:array': (value) => {
                let vals = []

                if ((typeof value === 'string')) {
                    vals = value.split(' ');
                } else {
                    vals = value;
                }

                return vals;
            },
            'type:map': (value) => {
                let subject = {};

                this._runTransform(value, (field, val) => {
                    subject[field] = this._k8sClientObject(field, val[field]);
                });

                return subject;
            }
        };

        this._yaml = parsedYaml;
        this._obj = this._k8sClientObject(this._yaml.kind, this._yaml);
    }

    kind() {
        return this._obj.kind;
    }

    metadata() {
        return this._obj.metadata;
    }

    toString() {
        return k8s.dumpYaml(this._obj);
    }

    k8sClientObject() {
        return this._obj;
    }

    _k8sClientObject(key, value) {

        if ((typeof value !== 'object') && !(Array.isArray(value)) && !key.includes('array'))
            return value;

        const valueTransform = this._fieldMap[key.toLowerCase()];

        if (!valueTransform) {
            throw new Error(`The requested key hasn't yet been implemented: ${key}`);
        }

        return valueTransform(value);
    }

    _runTransform(value, transform, exclusions = []) {
        for (const field in value) {
            if (!exclusions.includes(field)) {

                transform(field, value);
            }
        }
    }
}

export { K8sManifest };