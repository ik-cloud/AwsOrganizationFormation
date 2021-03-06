import * as chai from 'chai';
import { expect } from 'chai';
import { CloudFormationBinder, ICfnBinding } from '../../../src/cfn-binder/cfn-binder';
import { OrgResourceTypes } from '../../../src/parser/model/resource-types';
import { TemplateRoot } from '../../../src/parser/parser';
import { PersistedState } from '../../../src/state/persisted-state';
import { ICfnTemplate } from '../cfn-types';

chai.use(require('chai-as-promised'));

describe('when specifying !Ref in custom parameter binding', () => {
    let template: TemplateRoot;
    let cloudformationBinder: CloudFormationBinder;
    let bindings: ICfnBinding[];
    let account1Binding: ICfnBinding;
    let account1CfnTemplate: ICfnTemplate;

    beforeEach(() => {
        template = TemplateRoot.create('./test/resources/custom-parameter-binding/custom-parameter-binding.yml');
        const persistedState = PersistedState.CreateEmpty(template.organizationSection.masterAccount.accountId);
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '111111111111', logicalId: 'Account1', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '444444444444', logicalId: 'Account4', lastCommittedHash: 'abc'});

        cloudformationBinder = new CloudFormationBinder('custom-parameter-binding', template, persistedState);
        bindings = cloudformationBinder.enumBindings();
        account1Binding = bindings.find((x) => x.accountId === '111111111111');
        account1CfnTemplate = JSON.parse(account1Binding.template.createTemplateBody()) as ICfnTemplate;
    });

    it('ExportAccount is resolved', () => {
        expect(account1CfnTemplate).to.not.be.undefined;
        expect(account1CfnTemplate.Parameters).to.not.be.undefined;
        expect(account1CfnTemplate.Parameters.Param).to.not.be.undefined;
        expect(account1CfnTemplate.Parameters.Param.ExportAccountId).to.eq('444444444444');
    });
});

describe('when specifying !Ref in custom parameter binding to unknown account', () => {
    it('exception is thrown', () => {
        try {
            const template = TemplateRoot.create('./test/resources/custom-parameter-binding/custom-parameter-binding-non-existant.yml');
            const persistedState = PersistedState.CreateEmpty(template.organizationSection.masterAccount.accountId);
            persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '111111111111', logicalId: 'Account1', lastCommittedHash: 'abc'});
            persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '444444444444', logicalId: 'Account4', lastCommittedHash: 'abc'});

            const cloudformationBinder = new CloudFormationBinder('custom-parameter-binding', template, persistedState);
            const bindings = cloudformationBinder.enumBindings();
            const account1Binding = bindings.find((x) => x.accountId === '111111111111');
            account1Binding.template.enumBoundParameters();
            expect.fail('expected exception');
        } catch (err) {
            expect(err.message).to.contain('UnkownAccount');
        }
    });
});
