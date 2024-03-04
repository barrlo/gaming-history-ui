import {render, screen} from '@testing-library/react';
import Page from '../../src/app/page';

describe('Page', () => {
    it('should render the main page', () => {
        render(<Page/>);
        const header = screen.getByRole('heading', {level: 1});

        expect(header).toBeInTheDocument();
    });
});
