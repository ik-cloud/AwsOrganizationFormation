import { expect } from 'chai';
import { CloudFormationBinder, ICfnBinding } from '../../../src/cfn-binder/cfn-binder';
import { OrgResourceTypes } from '../../../src/parser/model/resource-types';
import { TemplateRoot } from '../../../src/parser/parser';
import { PersistedState } from '../../../src/state/persisted-state';
import { ICfnTemplate } from '../cfn-types';

describe('when loading template with default-bindings', () => {
    let template: TemplateRoot;
    let cloudformationBinder: CloudFormationBinder;
    let bindings: ICfnBinding[];

    beforeEach(() => {
        template = TemplateRoot.create('./test/resources/defaults/default-binding.yml');
        const persistedState = PersistedState.CreateEmpty(template.organizationSection.masterAccount.accountId);

        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '000000000000', logicalId: 'MasterAccount', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '111111111111', logicalId: 'Account1', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '222222222222', logicalId: 'Account2', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '333333333333', logicalId: 'Account3', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '444444444444', logicalId: 'Account4', lastCommittedHash: 'abc'});

        cloudformationBinder = new CloudFormationBinder('default-binding', template, persistedState);
        bindings = cloudformationBinder.enumBindings();
    });

    it('2 bindings are created', () => {
        expect(bindings).to.not.be.undefined;
        expect(bindings.length).to.eq(2);
    });

    it('topic is created in acc 1 and region eu-west-1', () => {
        const bindingAcc1 = bindings.find((x) => x.accountId === '111111111111');
        const templateAcc1 = JSON.parse(bindingAcc1.template.createTemplateBody()) as ICfnTemplate;
        expect(bindingAcc1.region).to.eq('eu-west-1');
        expect(templateAcc1.Resources.Topic).to.not.be.undefined;

    });

    it('s3 bucket is created in acc 2 and region eu-central-1', () => {
        const bindingAcc1 = bindings.find((x) => x.accountId === '222222222222');
        const templateAcc1 = JSON.parse(bindingAcc1.template.createTemplateBody()) as ICfnTemplate;
        expect(bindingAcc1.region).to.eq('eu-central-1');
        expect(templateAcc1.Resources.S3Bucket).to.not.be.undefined;

    });
});

describe('when loading template with default-regions', () => {
    let template: TemplateRoot;
    let cloudformationBinder: CloudFormationBinder;
    let bindings: ICfnBinding[];

    beforeEach(() => {
        template = TemplateRoot.create('./test/resources/defaults/default-regions.yml');
        const persistedState = PersistedState.CreateEmpty(template.organizationSection.masterAccount.accountId);

        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '000000000000', logicalId: 'MasterAccount', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '111111111111', logicalId: 'Account1', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '222222222222', logicalId: 'Account2', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '333333333333', logicalId: 'Account3', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '444444444444', logicalId: 'Account4', lastCommittedHash: 'abc'});

        cloudformationBinder = new CloudFormationBinder('default-regions', template, persistedState);
        bindings = cloudformationBinder.enumBindings();
    });

    it('3 bindings are created', () => {
        expect(bindings).to.not.be.undefined;
        expect(bindings.length).to.eq(3);
    });

    it('topic is created in acc 1 and region eu-west-1 and eu-central-1', () => {
        const bindingAccEuWest1 = bindings.find((x) => x.accountId === '111111111111' && x.region === 'eu-west-1' );
        const templateAccEuWest1 = JSON.parse(bindingAccEuWest1.template.createTemplateBody()) as ICfnTemplate;
        expect(templateAccEuWest1.Resources.Topic).to.not.be.undefined;

        const bindingAccEuCentral1 = bindings.find((x) => x.accountId === '111111111111' && x.region === 'eu-central-1' );
        const templateAccEuCentral1 = JSON.parse(bindingAccEuCentral1.template.createTemplateBody()) as ICfnTemplate;
        expect(templateAccEuCentral1.Resources.Topic).to.not.be.undefined;
    });

    it('s3 bucket is created in acc 1 and region eu-west-1', () => {
        const bindingAcc1 = bindings.find((x) => x.accountId === '111111111111' && x.region === 'us-east-1');
        const templateAcc1 = JSON.parse(bindingAcc1.template.createTemplateBody()) as ICfnTemplate;
        expect(templateAcc1.Resources.S3Bucket).to.not.be.undefined;

    });
});
