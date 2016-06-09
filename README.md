# Blue Form

This is a forms library I created for a Meteor project. At the moment I do not intend to support this as a community project but am happy to help where I can if you'd like to use it.

# Usage

```
import { BlueForm, BlueFormInput } from 'blue-form';

<div className="row">
  <div className="sixteen wide column">
    <div className="ui segment">
      <h3>Personal Info</h3>
      <BlueForm submit={ this.submitUserUpdate } type='update' data={ currentUser } schema={ UserSchema.accountPersonalInfo } autosave={ true }>
        <div className="field">
          <div className="two fields">
            <BlueFormInput name="profile.first_name" />
            <BlueFormInput name="profile.last_name" />
          </div>
        </div>
        <BlueFormInput name="profile.address" />
        <div className="field">
          <div className="three fields">
            <BlueFormInput name="profile.city" />
            <BlueFormInput name="profile.state" type="select" />
            <BlueFormInput name="profile.zip" />
          </div>
        </div>
        <BlueFormInput name="profile.website" />
        <BlueFormInput name="profile.phone" type="mask" mask={ {mask: '(111) 111-1111'} } />
      </BlueForm>
    </div>
</div>
</div>

```

Alternatively you can have the form build everything for you:

```
<BlueForm submit={ this.onSubmit } type="update" data={ incident } schema={ Incident_carAccidentForm } autosave={ true } />

```
