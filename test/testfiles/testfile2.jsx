import * as React from 'react';

class Plural extends React.Component {
    getSourceString() {
        return this.getSourceString;
    }

    render() {
        return <span class="myclass">this.props.children</span>;
    }
}

export default Plural;