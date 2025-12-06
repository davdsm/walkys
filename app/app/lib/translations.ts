export const translations = {
    pt: {
        // About
        about: {
            title: "Viste a transição? crazy",
        },
        // Header
        header: {
            begin: "Início",
            about: "Sobre",
            collection: "Coleção",
            contacts: "Contactos",
            menu: "Menu",
            close: "Fechar",
            socials: "Redes Sociais",
        },
        // Login
        login: {
            title: "Bem-vindo de volta",
            subtitle: "Insira o seu email e password para aceder à sua conta",
            email: "Email",
            emailPlaceholder: "Insira o seu email",
            password: "Password",
            passwordPlaceholder: "Insira a sua password",
            rememberMe: "Lembrar-me",
            forgotPassword: "Esqueceu a password?",
            signIn: "Entrar",
            signingIn: "A entrar...",
            noAccount: "Não tem conta?",
            signUp: "Registar",
            backToHome: "Voltar ao início",
        },
        // Signup
        signup: {
            title: "Criar conta",
            subtitle: "Preencha os seus dados para criar uma conta",
            fullName: "Nome completo",
            fullNamePlaceholder: "Insira o seu nome",
            email: "Email",
            emailPlaceholder: "Insira o seu email",
            birthDate: "Data de nascimento",
            password: "Password",
            passwordPlaceholder: "Insira a sua password",
            confirmPassword: "Confirmar password",
            confirmPasswordPlaceholder: "Confirme a sua password",
            signUp: "Registar",
            signingUp: "A registar...",
            haveAccount: "Já tem conta?",
            signIn: "Entrar",
            backToHome: "Voltar ao início",
        },
        // Forgot Password
        forgotPassword: {
            title: "Recuperar password",
            subtitle: "Insira o email que usou para criar a conta e enviaremos instruções para redefinir a sua password.",
            email: "Email",
            emailPlaceholder: "Insira o email",
            sendEmail: "Enviar email",
            sending: "A enviar...",
            rememberPassword: "Lembra-se da password?",
            login: "Entrar",
            emailSent: "Email enviado",
            emailSentMessage: "Enviámos um email para",
            checkInbox: "Verifique a sua caixa de entrada e siga as instruções para redefinir a password da sua conta.",
            didNotReceive: "Não recebeu o email?",
            resendEmail: "Reenviar email",
            wrongEmail: "Email errado?",
            changeEmail: "Alterar email",
            backToLogin: "Voltar ao login",
        },
        // Reset Password
        resetPassword: {
            title: "Criar nova password",
            subtitle: "A sua nova password deve ser diferente das passwords anteriores.",
            newPassword: "Nova password",
            newPasswordPlaceholder: "Confirmar nova password",
            confirmPassword: "Confirmar password",
            confirmPasswordPlaceholder: "Reintroduzir password",
            resetPassword: "Redefinir password",
            resetting: "A redefinir...",
            success: "Password redefinida com sucesso!",
            successMessage: "A sua password foi redefinida com sucesso. Pode agora entrar com a sua nova password.",
            redirecting: "A redirecionar para a página de login...",
        },
        // Validation errors
        errors: {
            emailRequired: "Email é obrigatório",
            emailInvalid: "Por favor insira um email válido",
            passwordRequired: "Password é obrigatória",
            passwordMinLength: "Password deve ter pelo menos 6 caracteres",
            passwordMinLength8: "Password deve ter pelo menos 8 caracteres",
            passwordRequirements: "Password deve conter maiúsculas, minúsculas e números",
            confirmPasswordRequired: "Por favor confirme a sua password",
            passwordsNotMatch: "As passwords não coincidem",
            fullNameRequired: "Nome completo é obrigatório",
            birthDateRequired: "Data de nascimento é obrigatória",
        },
        // Terms
        terms: {
            title: "Termos e Condições",
            lastUpdated: "Última atualização: 04 de dezembro de 2025",
            sections: [
                {
                    heading: "1. Apresentação e âmbito",
                    paragraphs: [
                        "Estes Termos e Condições regulam a utilização do serviço online fornecido por Walkys (\"nós\", \"nosso\"). Esta loja online permite que utilizadores solicitem produtos através de um formulário na página de cada produto. Não processamos pagamentos; o formulário serve para iniciar pedidos e comunicação entre a loja e o cliente."
                    ]
                },
                {
                    heading: "2. Processo de pedido (sem pagamentos)",
                    paragraphs: [
                        "Ao submeter o formulário de pedido de um produto, o utilizador está a solicitar mais informações ou a iniciar uma encomenda. O envio do formulário não implica pagamento automático nem conclusão de compra. Posteriormente, a equipa da Walkys entrará em contacto para confirmar disponibilidade, condições de entrega e outros detalhes necessários."
                    ]
                },
                {
                    heading: "3. Dados recolhidos e finalidade",
                    paragraphs: [
                        "Para processar pedidos utilizamos exclusivamente os dados que o utilizador fornece no formulário (por exemplo: nome, email, morada de entrega quando aplicável, número de telefone e detalhe do pedido). O email e outros contactos são guardados apenas para comunicar sobre o pedido, responder a perguntas, e coordenar a entrega/levantamento."
                    ]
                },
                {
                    heading: "4. Encarregado do tratamento e contacto",
                    paragraphs: [
                        "O responsável pelo tratamento dos dados é Walkys. Para questões relacionadas com proteção de dados, pedidos de exercício de direitos ou reclamações, contacte-nos através do email: support@your-domain.example (substitua pelo email real da sua organização)."
                    ]
                },
                {
                    heading: "5. Base legal para o tratamento (GDPR)",
                    paragraphs: [
                        "Tratamos os dados com base nas seguintes bases legais:"
                    ],
                    listItems: [
                        "Execução de medidas pré-contratuais e execução do contrato: para processar e comunicar sobre o pedido iniciado pelo utilizador.",
                        "Resposta a uma obrigação legal quando aplicável.",
                        "Consentimento: quando o utilizador optar por receber comunicações de marketing (opcional) — o consentimento pode ser retirado a qualquer momento."
                    ]
                },
                {
                    heading: "6. Conservação dos dados",
                    paragraphs: [
                        "Mantemos os dados pessoais apenas pelo tempo necessário para cumprir a finalidade do tratamento (por exemplo, até que a encomenda esteja concluída e por um período adicional para cumprimento de obrigações legais ou resolução de disputas). Em regra, os dados relacionados com pedidos são conservados por até 2 anos após a conclusão do serviço, salvo requisitos legais que exijam outro prazo."
                    ]
                },
                {
                    heading: "7. Direitos dos titulares de dados (UE/GDPR)",
                    paragraphs: [
                        "Se reside na União Europeia, tem direitos relativos aos seus dados pessoais, incluindo:"
                    ],
                    listItems: [
                        "Direito de acesso — obter uma cópia dos seus dados.",
                        "Direito de retificação — corrigir dados imprecisos ou incompletos.",
                        "Direito à eliminação — solicitar que apaguemos os seus dados, quando aplicável.",
                        "Direito à limitação do tratamento.",
                        "Direito de oposição ao tratamento, quando a base legal for interesse legítimo.",
                        "Direito à portabilidade dos dados, quando o tratamento for baseado em consentimento ou contrato e for realizado por meios automatizados."
                    ]
                },
                {
                    heading: "8. Partilha e subcontratação",
                    paragraphs: [
                        "Poderemos partilhar dados com prestadores de serviços que nos ajudem a operar a loja (por exemplo, serviços de email, logística) sob contratos que garantam a proteção adequada dos dados. Nunca vendemos dados pessoais a terceiros para fins comerciais."
                    ]
                },
                {
                    heading: "9. Cookies e tecnologias similares",
                    paragraphs: [
                        "O nosso site pode usar cookies para funcionalidades essenciais, estatísticas e preferências. Consulte a nossa política de cookies (se disponível) para mais detalhes e para gerir as suas preferências."
                    ]
                },
                {
                    heading: "10. Segurança",
                    paragraphs: [
                        "Implementamos medidas técnicas e organizativas razoáveis para proteger os dados pessoais. Contudo, nenhum método de transmissão pela Internet ou armazenamento eletrónico é 100% seguro; não podemos garantir segurança absoluta."
                    ]
                },
                {
                    heading: "11. Alterações a estes Termos",
                    paragraphs: [
                        "Podemos atualizar estes Termos ocasionalmente. Publicaremos a versão atualizada nesta página com a data da última atualização. Se as alterações forem substanciais, comunicaremos de forma mais proeminente."
                    ]
                },
                {
                    heading: "12. Lei aplicável e foro",
                    paragraphs: [
                        "Estes Termos são regidos pela legislação aplicável no país da sede da Walkys. Para residentes da UE, aplicam-se as leis de proteção de dados da União Europeia conforme descrito acima."
                    ]
                },
                {
                    heading: "13. Contacto",
                    paragraphs: [
                        "Para questões sobre estes Termos ou sobre os seus dados pessoais contacte-nos em: support@your-domain.example."
                    ]
                }
            ],
            note: "Nota: Substitua support@your-domain.example e o nome da empresa pelos seus dados reais antes de publicar."
        },
        // Privacy
        privacy: {
            title: "Política de Privacidade",
            lastUpdated: "Última atualização: 04 de dezembro de 2025",
            introduction: "Esta Política de Privacidade explica como tratamos os seus dados pessoais quando utiliza os nossos serviços. Se reside em Portugal ou na União Europeia, os seus direitos são assegurados pelo RGPD (Regulamento Geral sobre a Proteção de Dados).",
            sections: [
                {
                    heading: "1. Responsável pelo tratamento",
                    paragraphs: [
                        "O responsável pelo tratamento dos seus dados é Walkys (" + '"nós"' + "). Para questões relacionadas com privacidade contacte: support@your-domain.example (substitua pelo email real)."
                    ]
                },
                {
                    heading: "2. Dados que recolhemos",
                    paragraphs: [
                        "Recolhemos apenas os dados que você fornece no formulário de pedido (por exemplo: nome, email, morada de entrega quando aplicável, telefone) e metadados técnicos quando visita o site (cookies, IP, etc.)."
                    ]
                },
                {
                    heading: "3. Finalidades do tratamento",
                    paragraphs: [
                        "Os seus dados são utilizados para responder a pedidos, processar encomendas iniciadas pelo formulário, comunicar sobre o estado da encomenda e para cumprir obrigações legais. Poderemos também usar dados com o seu consentimento para enviar comunicações de marketing."
                    ]
                },
                {
                    heading: "4. Base legal",
                    paragraphs: [
                        "As bases legais incluem: execução de medidas pré-contratuais e do contrato, cumprimento de obrigações legais, e consentimento do titular quando aplicável (por ex., marketing)."
                    ]
                },
                {
                    heading: "5. Conservação dos dados",
                    paragraphs: [
                        "Conservamos os dados enquanto forem necessários para a finalidade indicada e de acordo com requisitos legais. Em geral, os dados de pedidos são guardados por até 2 anos após a conclusão do serviço, salvo exigências legais em contrário."
                    ]
                },
                {
                    heading: "6. Direitos dos titulares",
                    paragraphs: [
                        "Tem direito de acesso, retificação, eliminação, limitação do tratamento, oposição, e portabilidade dos dados. Para exercer os seus direitos contacte-nos no email indicado acima."
                    ]
                },
                {
                    heading: "7. Reclamação à autoridade de controlo",
                    paragraphs: [
                        "Se residir em Portugal pode apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD)."
                    ]
                },
                {
                    heading: "8. Partilha e subcontratantes",
                    paragraphs: [
                        "Podemos partilhar dados com fornecedores que prestam serviços em nosso nome (por exemplo, envio de emails, logística) sob contratos que garantem a proteção adequada dos dados."
                    ]
                },
                {
                    heading: "9. Transferências internacionais",
                    paragraphs: [
                        "Se os dados forem transferidos para fora da UE, garantimos salvaguardas adequadas (cláusulas contratuais padrão ou decisões de adequação) ou apenas o faremos quando estritamente necessário."
                    ]
                },
                {
                    heading: "10. Segurança",
                    paragraphs: [
                        "Implementamos medidas técnicas e organizativas para proteger os seus dados contra perda, acesso não autorizado e divulgação indevida."
                    ]
                },
                {
                    heading: "11. Cookies",
                    paragraphs: [
                        "Utilizamos cookies essenciais e analíticos. Consulte a nossa política de cookies para gerir preferências."
                    ]
                },
                {
                    heading: "12. Alterações a esta política",
                    paragraphs: [
                        "Podemos atualizar esta Política; publicaremos a versão atualizada com a data da última alteração."
                    ]
                }
            ],
            note: "Nota: substitua support@your-domain.example pelo email real da organização antes de publicar."
        },
        // Small CTA Component
        smallCTA: {
            heading: "SHINNING SINCE 1981",
            subtitle: "Um texto sobre a empresa, algo icónico, mas fixe e bonito, que tenha algumas linhas até.",
            buttonText: "SHOP NOW",
        },
        // Cookie specifics
        cookies: {
            title: "Política de Cookies",
            pocketbase: {
                heading: "Uso do PocketBase",
                paragraphs: [
                    "O nosso site utiliza PocketBase como backend. Para manter sessões de autenticação e estado do utilizador, PocketBase pode armazenar um cookie de autenticação (`pb_auth`) no navegador ou utilizar `localStorage` quando aplicável.",
                    "Este cookie ou token apenas identifica a sua sessão e não contém passwords em texto claro. É usado para: autenticar pedidos ao servidor PocketBase, manter a sessão ativa e permitir ações autorizadas (por exemplo, aceder a dados da sua encomenda).",
                    "Se pretender, pode eliminar este cookie através das definições do seu navegador; ao fazê-lo poderá ser ocasionalmente necessário voltar a autenticar-se."
                ]
            },
            general: {
                heading: "Cookies gerais",
                paragraphs: [
                    "Usamos cookies essenciais para funcionalidades necessárias (por exemplo, manter sessão) e cookies analíticos para melhorar o serviço. Os cookies analíticos são anónimos e agregados."
                ]
            },
            note: "Nota: o comportamento exato depende da configuração do navegador e das escolhas do utilizador."
        },
        // Contact
        contact: {
            title: "VAMOS CONVERSAR",
            email: "administracao@walkys.pt",
            name: "Nome",
            namePlaceholder: "O seu nome",
            subject: "Assunto",
            subjectPlaceholder: "ex: Devoluções",
            company: "Empresa",
            companyPlaceholder: "A sua empresa",
            emailLabel: "Email",
            emailPlaceholder: "Endereço de email",
            message: "Mensagem",
            messagePlaceholder: "Comece a escrever aqui...",
            submit: "Enviar Mensagem",
            findUs: "ENCONTRE-NOS",
            address: "V.N. Sande, Famalicão",
            phone: "+351 253 162 123",
        },
        // Footer
        footer: {
            begin: "Início",
            about: "A Walkys",
            collection: "Outono / Inverno",
            contacts: "Contactos",
            terms: "Termos & Condições",
            privacy: "Privacidade",
            contact: "Contacto",
            address: "Morada",
            email: "Email",
            schedule: "Seg—Sex",
            explore: "Explorar",
            newCollection: "NOVA COLEÇÃO",
            copyright: "© 2025 – Copyright",
        },
    },
    en: {
        // About
        about: {
            title: "Did you see the transition? crazy",
        },
        // Header
        header: {
            begin: "Begin",
            about: "About",
            collection: "Collection",
            contacts: "Contacts",
            menu: "Menu",
            close: "Close",
            socials: "Socials",
        },
        // Login
        login: {
            title: "Welcome Back",
            subtitle: "Enter your email and password to access your account",
            email: "Email",
            emailPlaceholder: "Enter your email",
            password: "Password",
            passwordPlaceholder: "Enter your password",
            rememberMe: "Remember me",
            forgotPassword: "Forgot Password",
            signIn: "Sign In",
            signingIn: "Signing In...",
            noAccount: "Don't have an account?",
            signUp: "Sign Up",
            backToHome: "Back to Home",
        },
        // Signup
        signup: {
            title: "Create Account",
            subtitle: "Fill in your details to create an account",
            fullName: "Full Name",
            fullNamePlaceholder: "Enter your name",
            email: "Email",
            emailPlaceholder: "Enter your email",
            birthDate: "Birth Date",
            password: "Password",
            passwordPlaceholder: "Enter your password",
            confirmPassword: "Confirm Password",
            confirmPasswordPlaceholder: "Confirm your password",
            signUp: "Sign Up",
            signingUp: "Signing Up...",
            haveAccount: "Already have an account?",
            signIn: "Sign In",
            backToHome: "Back to Home",
        },
        // Forgot Password
        forgotPassword: {
            title: "Forgot Password",
            subtitle: "Enter the email address you used to create the account, and we will email you instructions to reset your password.",
            email: "Email Address",
            emailPlaceholder: "Enter Email",
            sendEmail: "Send Email",
            sending: "Sending...",
            rememberPassword: "Remember Password?",
            login: "Login",
            emailSent: "Email Sent",
            emailSentMessage: "We have sent you an email at",
            checkInbox: "Check your inbox and follow the instructions to reset your account password.",
            didNotReceive: "Did not receive the email?",
            resendEmail: "Resend Email",
            wrongEmail: "Wrong Email Address?",
            changeEmail: "Change Email Address",
            backToLogin: "Back to Login",
        },
        // Reset Password
        resetPassword: {
            title: "Create New Password",
            subtitle: "Your new password must be different from any of your previous passwords.",
            newPassword: "New Password",
            newPasswordPlaceholder: "Confirm New Password",
            confirmPassword: "Confirm Password",
            confirmPasswordPlaceholder: "Re-enter Password",
            resetPassword: "Reset Password",
            resetting: "Resetting...",
            success: "Password Reset Successful!",
            successMessage: "Your password has been successfully reset. You can now login with your new password.",
            redirecting: "Redirecting to login page...",
        },
        // Validation errors
        errors: {
            emailRequired: "Email is required",
            emailInvalid: "Please enter a valid email",
            passwordRequired: "Password is required",
            passwordMinLength: "Password must be at least 6 characters",
            passwordMinLength8: "Password must be at least 8 characters",
            passwordRequirements: "Password must contain uppercase, lowercase, and number",
            confirmPasswordRequired: "Please confirm your password",
            passwordsNotMatch: "Passwords do not match",
            fullNameRequired: "Full name is required",
            birthDateRequired: "Birth date is required",
        },
        // Terms
        terms: {
            title: "Terms and Conditions",
            lastUpdated: "Last updated: 4 December 2025",
            sections: [
                {
                    heading: "1. Introduction and scope",
                    paragraphs: [
                        "These Terms and Conditions govern the use of the online service provided by Walkys (\"we\", \"us\"). This online shop allows users to request products via a form on each product page. We do not process payments; the form is used to initiate requests and communication between the shop and the customer."
                    ]
                },
                {
                    heading: "2. Order process (no payments)",
                    paragraphs: [
                        "By submitting a product request form, the user is asking for more information or initiating an order. Submitting the form does not trigger an automatic payment or completion of purchase. Our team will contact you to confirm availability, delivery terms and other necessary details."
                    ]
                },
                {
                    heading: "3. Data collected and purpose",
                    paragraphs: [
                        "To process requests we only use the data the user provides in the form (for example: name, email, delivery address where applicable, phone number, and order details). Email and other contact details are stored only to communicate about the order, respond to inquiries, and coordinate delivery/pickup."
                    ]
                },
                {
                    heading: "4. Data controller and contact",
                    paragraphs: [
                        "The data controller is Walkys. For questions related to data protection, rights requests or complaints, contact us at: support@your-domain.example (replace with your organization's real email)."
                    ]
                },
                {
                    heading: "5. Legal basis for processing (GDPR)",
                    paragraphs: [
                        "We process personal data based on the following legal bases:"
                    ],
                    listItems: [
                        "Performance of pre-contractual measures and contract execution: to process and communicate about the request initiated by the user.",
                        "Compliance with a legal obligation when applicable.",
                        "Consent: when the user opts in to receive marketing communications (optional) — consent may be withdrawn at any time."
                    ]
                },
                {
                    heading: "6. Data retention",
                    paragraphs: [
                        "We retain personal data only as long as necessary to fulfill the processing purpose (for example, until the order is completed and for an additional period to comply with legal obligations or resolve disputes). Generally, order-related data is retained for up to 2 years after service completion, unless a different period is required by law."
                    ]
                },
                {
                    heading: "7. Data subject rights (EU/GDPR)",
                    paragraphs: [
                        "If you reside in the European Union, you have rights regarding your personal data, including:"
                    ],
                    listItems: [
                        "Right of access — obtain a copy of your personal data.",
                        "Right to rectification — correct inaccurate or incomplete data.",
                        "Right to erasure — request deletion of your data, where applicable.",
                        "Right to restriction of processing.",
                        "Right to object to processing where the legal basis is legitimate interests.",
                        "Right to data portability when processing is based on consent or contract and is carried out by automated means."
                    ]
                },
                {
                    heading: "8. Sharing and subprocessors",
                    paragraphs: [
                        "We may share data with service providers who help us operate the shop (e.g., email providers, logistics) under agreements that ensure appropriate data protection. We never sell personal data to third parties for commercial purposes."
                    ]
                },
                {
                    heading: "9. Cookies and similar technologies",
                    paragraphs: [
                        "Our site may use cookies for essential functionality, analytics and preferences. See our cookie policy (if available) for details and to manage your preferences."
                    ]
                },
                {
                    heading: "10. Security",
                    paragraphs: [
                        "We implement reasonable technical and organizational measures to protect personal data. However, no method of transmission over the Internet or electronic storage is 100% secure; we cannot guarantee absolute security."
                    ]
                },
                {
                    heading: "11. Changes to these Terms",
                    paragraphs: [
                        "We may update these Terms from time to time. We will publish the updated version on this page with the date of last update. If changes are significant we will communicate them more prominently."
                    ]
                },
                {
                    heading: "12. Governing law and jurisdiction",
                    paragraphs: [
                        "These Terms are governed by the laws applicable in the country where Walkys is registered. For EU residents, data protection laws of the European Union apply as described above."
                    ]
                },
                {
                    heading: "13. Contact",
                    paragraphs: [
                        "For questions about these Terms or your personal data contact us at: support@your-domain.example."
                    ]
                }
            ],
            note: "Note: Replace support@your-domain.example and the company name with your real details before publishing."
        },
        // Privacy
        privacy: {
            title: "Privacy Policy",
            lastUpdated: "Last updated: 4 December 2025",
            introduction: "This Privacy Policy explains how we process your personal data when you use our services. If you are in Portugal or the EU, your rights are protected under the GDPR.",
            sections: [
                {
                    heading: "1. Data controller",
                    paragraphs: [
                        "The data controller is Walkys (\"we\"). For privacy questions contact: support@your-domain.example (replace with your real email)."
                    ]
                },
                {
                    heading: "2. Data collected",
                    paragraphs: [
                        "We collect the information you provide in product request forms (e.g. name, email, delivery address when applicable, phone) and technical metadata when you visit the site (cookies, IP, etc.)."
                    ]
                },
                {
                    heading: "3. Purposes of processing",
                    paragraphs: [
                        "Your data is used to respond to requests, handle orders initiated via the form, communicate about order status and to comply with legal obligations. We may also use data for marketing communications with your consent."
                    ]
                },
                {
                    heading: "4. Legal basis",
                    paragraphs: [
                        "Legal bases include: performance of pre-contractual measures and contract, compliance with legal obligations, and consent where applicable (e.g., marketing)."
                    ]
                },
                {
                    heading: "5. Data retention",
                    paragraphs: [
                        "We retain data only as long as necessary for the stated purposes and according to legal requirements. Typically, order-related data is kept for up to 2 years after service completion unless law requires otherwise."
                    ]
                },
                {
                    heading: "6. Data subject rights",
                    paragraphs: [
                        "You have rights to access, rectification, erasure, restriction of processing, objection, and data portability. To exercise your rights contact us at the email above."
                    ]
                },
                {
                    heading: "7. Supervisory authority",
                    paragraphs: [
                        "If you are in Portugal you may lodge a complaint with the Comissão Nacional de Proteção de Dados (CNPD)."
                    ]
                },
                {
                    heading: "8. Sharing and subprocessors",
                    paragraphs: [
                        "We may share data with providers who perform services on our behalf (e.g., email providers, logistics) under contracts that ensure appropriate data protection."
                    ]
                },
                {
                    heading: "9. International transfers",
                    paragraphs: [
                        "If data is transferred outside the EU, we ensure appropriate safeguards (standard contractual clauses or adequacy decisions) or only transfer when strictly necessary."
                    ]
                },
                {
                    heading: "10. Security",
                    paragraphs: [
                        "We implement technical and organizational measures to protect personal data against loss, unauthorized access and disclosure."
                    ]
                },
                {
                    heading: "11. Cookies",
                    paragraphs: [
                        "We use essential and analytics cookies. See our cookie policy to manage preferences."
                    ]
                },
                {
                    heading: "12. Changes to this policy",
                    paragraphs: [
                        "We may update this Policy; we will post the updated version with the date of last modification."
                    ]
                }
            ],
            note: "Note: replace support@your-domain.example with your real contact email before publishing."
        },
        // Small CTA Component
        smallCTA: {
            heading: "SHINNING SINCE 1981",
            subtitle: "A text about the company, something iconic, but cool and beautiful, that has a few lines to.",
            buttonText: "SHOP NOW",
        },
        // Cookie specifics
        cookies: {
            title: "Cookie Policy",
            pocketbase: {
                heading: "Use of PocketBase",
                paragraphs: [
                    "Our site uses PocketBase as a backend. To maintain authentication sessions and user state, PocketBase may store an authentication cookie (`pb_auth`) in the browser or use `localStorage` where applicable.",
                    "This cookie or token only identifies your session and does not contain plaintext passwords. It is used to: authenticate requests to the PocketBase server, keep the session active and allow authorized actions (e.g., accessing your order data).",
                    "You can remove this cookie via your browser settings; doing so may require you to re-authenticate occasionally."
                ]
            },
            general: {
                heading: "General cookies",
                paragraphs: [
                    "We use essential cookies for necessary functionality (e.g., session maintenance) and analytics cookies to improve the service. Analytics cookies are anonymous and aggregated."
                ]
            },
            note: "Note: exact behavior depends on browser settings and user choices."
        },
        // Contact
        contact: {
            title: "LET'S TALK",
            email: "administracao@walkys.pt",
            name: "Name",
            namePlaceholder: "Your Name",
            subject: "Subject",
            subjectPlaceholder: "i.e. Returns",
            company: "Company",
            companyPlaceholder: "Your Company",
            emailLabel: "Email",
            emailPlaceholder: "Email Address",
            message: "Message",
            messagePlaceholder: "Start typing here...",
            submit: "Send Message",
            findUs: "FIND US",
            address: "V.N. Sande, Famalicão",
            phone: "+351 253 162 123",
        },
        // Footer
        footer: {
            begin: "Begin",
            about: "Walkys",
            collection: "Autumn / Winter",
            contacts: "Contacts",
            terms: "Terms & Conditions",
            privacy: "Privacy",
            contact: "Contact",
            address: "Address",
            email: "Email",
            schedule: "Mon—Fri",
            explore: "Explore",
            newCollection: "NEW COLLECTION",
            copyright: "© 2025 – Copyright",
        },
    },
} as const;

export type TranslationKey = keyof typeof translations.pt;
