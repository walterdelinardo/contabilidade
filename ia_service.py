import openai
import os
from typing import Dict, List, Optional
import json
import re
from datetime import datetime

class IAService:
    def __init__(self):
        """Inicializar o serviço de IA com OpenAI API"""
        self.client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY'),
            base_url=os.getenv('OPENAI_API_BASE')
        )
    
    def analisar_documento(self, texto_documento: str, tipo_documento: str, categoria: str) -> Dict:
        """
        Analisar documento usando IA para extrair informações importantes
        """
        try:
            prompt = self._criar_prompt_analise_documento(texto_documento, tipo_documento, categoria)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente especializado em análise de documentos contábeis brasileiros."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            resultado = response.choices[0].message.content
            return self._processar_resultado_analise(resultado)
            
        except Exception as e:
            return {
                'resumo': f'Erro na análise: {str(e)}',
                'pontos_importantes': 'Não foi possível processar o documento.',
                'valores_extraidos': {},
                'alertas': ['Erro no processamento automático']
            }
    
    def _criar_prompt_analise_documento(self, texto: str, tipo: str, categoria: str) -> str:
        """Criar prompt específico para análise de documento"""
        
        prompts_por_categoria = {
            'folha_pagamento': """
            Analise esta folha de pagamento e extraia:
            1. Número total de funcionários
            2. Valor total dos salários
            3. Principais deduções (INSS, IRRF, etc.)
            4. Novos funcionários ou demissões
            5. Aumentos salariais ou alterações importantes
            6. Alertas sobre valores fora do padrão
            """,
            'nota_fiscal': """
            Analise estas notas fiscais e extraia:
            1. Número total de notas
            2. Valor total das vendas/compras
            3. Principais clientes/fornecedores
            4. Produtos/serviços mais vendidos
            5. Impostos incidentes
            6. Alertas sobre irregularidades
            """,
            'extrato_bancario': """
            Analise este extrato bancário e extraia:
            1. Saldo inicial e final
            2. Número total de transações
            3. Maiores movimentações (entradas e saídas)
            4. Padrões de movimentação
            5. Taxas e tarifas cobradas
            6. Alertas sobre movimentações suspeitas
            """,
            'comprovante_pagamento': """
            Analise estes comprovantes de pagamento e extraia:
            1. Valor total pago
            2. Beneficiários dos pagamentos
            3. Formas de pagamento utilizadas
            4. Datas de vencimento e pagamento
            5. Juros ou multas aplicadas
            6. Alertas sobre atrasos ou irregularidades
            """
        }
        
        prompt_especifico = prompts_por_categoria.get(categoria, """
        Analise este documento contábil e extraia:
        1. Informações principais do documento
        2. Valores monetários relevantes
        3. Datas importantes
        4. Observações relevantes
        5. Possíveis alertas ou irregularidades
        """)
        
        return f"""
        {prompt_especifico}
        
        Documento ({tipo} - {categoria}):
        {texto[:3000]}  # Limitar texto para não exceder tokens
        
        Responda em formato JSON com as seguintes chaves:
        - "resumo": resumo executivo do documento
        - "pontos_importantes": lista de pontos importantes
        - "valores_extraidos": objeto com valores monetários encontrados
        - "alertas": lista de alertas ou observações importantes
        """
    
    def _processar_resultado_analise(self, resultado: str) -> Dict:
        """Processar resultado da análise de IA"""
        try:
            # Tentar extrair JSON do resultado
            json_match = re.search(r'\{.*\}', resultado, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                # Se não conseguir extrair JSON, criar estrutura básica
                return {
                    'resumo': resultado[:500],
                    'pontos_importantes': 'Análise processada com sucesso.',
                    'valores_extraidos': {},
                    'alertas': []
                }
        except:
            return {
                'resumo': resultado[:500] if resultado else 'Análise concluída.',
                'pontos_importantes': 'Documento processado.',
                'valores_extraidos': {},
                'alertas': []
            }
    
    def gerar_sugestoes_obrigacoes(self, cliente_info: Dict, mes_referencia: str) -> List[Dict]:
        """
        Gerar sugestões de obrigações baseadas no perfil do cliente
        """
        try:
            prompt = f"""
            Com base nas informações do cliente abaixo, sugira as principais obrigações tributárias 
            que devem ser cumpridas no mês {mes_referencia}:
            
            Cliente: {cliente_info.get('nome', '')}
            CNPJ: {cliente_info.get('cnpj', '')}
            Regime Tributário: {cliente_info.get('regime_tributario', '')}
            
            Para cada obrigação, forneça:
            - Tipo (DAS, DARF, INSS, etc.)
            - Descrição
            - Data de vencimento típica
            - Observações importantes
            
            Responda em formato JSON com uma lista de obrigações.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um especialista em obrigações tributárias brasileiras."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            resultado = response.choices[0].message.content
            return self._processar_sugestoes_obrigacoes(resultado)
            
        except Exception as e:
            return [{
                'tipo': 'ERRO',
                'descricao': f'Erro ao gerar sugestões: {str(e)}',
                'data_vencimento': '',
                'observacoes': 'Consulte um contador para obrigações específicas.'
            }]
    
    def _processar_sugestoes_obrigacoes(self, resultado: str) -> List[Dict]:
        """Processar sugestões de obrigações da IA"""
        try:
            json_match = re.search(r'\[.*\]', resultado, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return []
        except:
            return []
    
    def gerar_mensagem_automatica(self, tipo_mensagem: str, contexto: Dict) -> str:
        """
        Gerar mensagens automáticas para comunicação com clientes
        """
        try:
            prompts_mensagem = {
                'lembrete_vencimento': f"""
                Crie uma mensagem profissional e cordial para lembrar o cliente sobre vencimento de obrigação:
                
                Cliente: {contexto.get('cliente_nome', '')}
                Obrigação: {contexto.get('obrigacao_tipo', '')} - {contexto.get('obrigacao_descricao', '')}
                Valor: R$ {contexto.get('valor', '0,00')}
                Data de Vencimento: {contexto.get('data_vencimento', '')}
                
                A mensagem deve ser:
                - Profissional e cordial
                - Clara sobre a obrigação
                - Incluir informações de contato
                - Oferecer suporte
                """,
                
                'documento_pendente': f"""
                Crie uma mensagem para solicitar documentos pendentes:
                
                Cliente: {contexto.get('cliente_nome', '')}
                Documentos Pendentes: {contexto.get('documentos_pendentes', '')}
                Mês de Referência: {contexto.get('mes_referencia', '')}
                
                A mensagem deve ser:
                - Cordial mas assertiva
                - Listar documentos específicos
                - Explicar a importância dos documentos
                - Dar prazo para envio
                """,
                
                'inadimplencia': f"""
                Crie uma mensagem sobre inadimplência de mensalidade:
                
                Cliente: {contexto.get('cliente_nome', '')}
                Valor em Atraso: R$ {contexto.get('valor_atraso', '0,00')}
                Dias de Atraso: {contexto.get('dias_atraso', '0')}
                
                A mensagem deve ser:
                - Profissional mas firme
                - Mencionar o atraso
                - Oferecer opções de pagamento
                - Manter relacionamento cordial
                """
            }
            
            prompt = prompts_mensagem.get(tipo_mensagem, "Crie uma mensagem profissional para o cliente.")
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente que cria mensagens profissionais para escritórios contábeis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Erro ao gerar mensagem: {str(e)}"
    
    def responder_pergunta_contador(self, pergunta: str, contexto: Optional[Dict] = None) -> str:
        """
        Responder perguntas do contador usando IA
        """
        try:
            contexto_str = ""
            if contexto:
                contexto_str = f"\nContexto adicional: {json.dumps(contexto, indent=2)}"
            
            prompt = f"""
            Responda a seguinte pergunta de um contador brasileiro, considerando a legislação e práticas contábeis atuais:
            
            Pergunta: {pergunta}
            {contexto_str}
            
            Forneça uma resposta:
            - Precisa e técnica
            - Baseada na legislação brasileira
            - Com exemplos práticos quando relevante
            - Incluindo alertas sobre mudanças recentes se aplicável
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um especialista em contabilidade brasileira com conhecimento atualizado sobre legislação tributária e práticas contábeis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Desculpe, não foi possível processar sua pergunta no momento. Erro: {str(e)}"
    
    def resumir_alteracoes_legislacao(self, texto_legislacao: str) -> Dict:
        """
        Resumir alterações na legislação tributária
        """
        try:
            prompt = f"""
            Analise as seguintes alterações na legislação tributária brasileira e crie um resumo executivo:
            
            {texto_legislacao[:2000]}
            
            Forneça um resumo com:
            - Principais mudanças
            - Impacto para empresas
            - Prazos importantes
            - Ações recomendadas
            
            Responda em formato JSON com as chaves: "resumo", "principais_mudancas", "impactos", "prazos", "acoes_recomendadas"
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um especialista em legislação tributária brasileira."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            resultado = response.choices[0].message.content
            return self._processar_resultado_legislacao(resultado)
            
        except Exception as e:
            return {
                'resumo': f'Erro ao processar legislação: {str(e)}',
                'principais_mudancas': [],
                'impactos': [],
                'prazos': [],
                'acoes_recomendadas': []
            }
    
    def _processar_resultado_legislacao(self, resultado: str) -> Dict:
        """Processar resultado da análise de legislação"""
        try:
            json_match = re.search(r'\{.*\}', resultado, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'resumo': resultado[:500],
                    'principais_mudancas': [],
                    'impactos': [],
                    'prazos': [],
                    'acoes_recomendadas': []
                }
        except:
            return {
                'resumo': resultado[:500] if resultado else 'Análise processada.',
                'principais_mudancas': [],
                'impactos': [],
                'prazos': [],
                'acoes_recomendadas': []
            }

