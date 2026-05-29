import Empresa from './pages/Empresa';
import CadastroLotes from './pages/CadastroLotes';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Empresa": Empresa,
    "CadastroLotes": CadastroLotes,
}

export const pagesConfig = {
    mainPage: "CadastroLotes",
    Pages: PAGES,
    Layout: __Layout,
};