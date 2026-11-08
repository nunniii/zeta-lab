# Zeta Lab — Investigação matemática sobre divisores, circunferências e inteiros de Gauss

> **Status:** notas de pesquisa com demonstrações verificáveis.  
> **Documento de origem:** [`ia.md`](https://github.com/nunniii/zeta-lab/blob/main/ia.md).  
> **Escopo:** inteiros positivos, pares de divisores, normas gaussianas e circunferências centradas na origem.

## 1. Problema central

Estudar quando dois inteiros positivos distintos $n$ e $m$ possuem pares de divisores $(a,b)$ e $(c,d)$ tais que

$$
ab=n,\qquad cd=m,\qquad a^2+b^2=c^2+d^2=R.
$$

Geometricamente, os retângulos de lados inteiros têm áreas diferentes, mas a mesma diagonal $\sqrt R$. A investigação considera **lados estritamente positivos**; representações com coordenada zero não definem áreas positivas.

## 2. Notação

- $D(n)=\{d\in\mathbb N^+:d\mid n\}$: divisores positivos de $n$.
- $P(n)=\{(d,n/d):d\mid n,\ d\le\sqrt n\}$: pares de divisores, sem repetir a troca de coordenadas.
- $T_n(d)=n/d$: involução sobre $D(n)$, pois $T_n(T_n(d))=d$.
- $R=a^2+b^2$: **raio ao quadrado**, não o raio. O raio geométrico é $r=\sqrt R$.
- $N(a+bi)=a^2+b^2$: norma no anel dos inteiros de Gauss $\mathbb Z[i]$.
- $\mathcal R(n)=\{a^2+b^2:(a,b)\in P(n)\}$: espectro de raios ao quadrado de $n$.
- $\mathcal A(R)=\{ab:1\le a\le b,\ a,b\in\mathbb Z,\ a^2+b^2=R\}$: conjunto de áreas positivas associadas a $R$.
- $n\sim m$ significa $\mathcal R(n)\cap\mathcal R(m)\ne\varnothing$.

## 3. Identidades fundamentais

Para $ab=n$ e $s=a+b$,

$$
R=a^2+b^2=(a+b)^2-2ab=s^2-2n.
$$

Portanto,

$$
\boxed{n=\frac{s^2-R}{2}}.
$$

Escrevendo $\delta=|a-b|$, temos

$$
R=(a-b)^2+2ab=\delta^2+2n,
\qquad
\boxed{n=\frac{R-\delta^2}{2}}.
$$

Para $R$ fixo, a área cresce com a soma dos lados $s$ e diminui com o desequilíbrio $\delta$. A desigualdade $2ab\le a^2+b^2$ fornece $n\le R/2$, com igualdade somente quando $a=b$; com lados inteiros, isso exige $R=2k^2$ para algum $k\in\mathbb N^+$.

A identidade de Brahmagupta–Fibonacci é

$$
(a^2+b^2)(c^2+d^2)
=(ac-bd)^2+(ad+bc)^2
=(ac+bd)^2+(ad-bc)^2.
$$

Ela constrói representações de produtos como somas de dois quadrados, embora as representações obtidas possam coincidir após trocar sinais e coordenadas.

## 4. Auditoria das afirmações do registro original

| Afirmação | Avaliação rigorosa |
|---|---|
| $R=(a+b)^2-2n$ | Identidade correta. |
| $T_n$ é uma involução | Correta no conjunto $D(n)$. |
| $R=N(a+bi)$ | Correta. |
| A identidade de Brahmagupta–Fibonacci gera representações | Correta; não garante representações distintas. |
| Múltiplas representações de $R$ implicam múltiplas áreas | Somente após restringir a pares **positivos e não ordenados** distintos. |
| Os fatores primos $1\pmod4$ controlam a contagem | Correto com as correções de eixos e diagonal. |
| A fatoração de $R$ é a fatoração central | É central no problema $R\to\mathcal A(R)$; partindo de $n$, a fatoração de $n$ ou de diferenças entre áreas também importa. |

### 4.1. Teorema das duas somas de quadrados

Um inteiro $R>0$ admite $R=a^2+b^2$ com $a,b\in\mathbb Z$ se, e somente se, todos os primos $q\equiv3\pmod4$ têm expoente par na fatoração de $R$.

**Atenção:** isso permite $a=0$ ou $b=0$. O problema de áreas do Zeta Lab requer $a,b>0$.

### 4.2. Contagem exata de áreas positivas

Se

$$
R=2^\alpha\prod_{p\equiv1\ (4)}p^{e_p}\prod_{q\equiv3\ (4)}q^{f_q},
$$

então a quantidade $r_2(R)$ de pares **ordenados com sinais** $(a,b)\in\mathbb Z^2$ satisfaz

$$
r_2(R)=
\begin{cases}
4\displaystyle\prod_{p\equiv1\ (4)}(e_p+1),&\text{se todos os }f_q\text{ são pares};\\
0,&\text{caso contrário}.
\end{cases}
$$

Defina $I_{\square}(R)=1$ quando $R$ é um quadrado perfeito, e $0$ caso contrário; defina $I_{2\square}(R)=1$ quando $R=2k^2$ para algum inteiro positivo $k$, e $0$ caso contrário. O número de pares positivos não ordenados, equivalente a $|\mathcal A(R)|$, é

$$
\boxed{k(R)=|\mathcal A(R)|=\frac{r_2(R)-4I_{\square}(R)+4I_{2\square}(R)}8}.
$$

**Justificativa da correção:** cada representação com $0<a<b$ gera oito pares ordenados com sinais; uma representação diagonal $(a,a)$ gera quatro; uma representação sobre os eixos $(a,0)$ gera quatro, mas não conta como área positiva. Subtrair as quatro representações de eixo e somar a correção de quatro para a diagonal produz a fórmula.

| $R$ | Pares positivos $a\le b$ | Áreas $ab$ | $k(R)$ |
|---:|---|---|---:|
| 25 | $(3,4)$ | $12$ | 1 |
| 50 | $(1,7),(5,5)$ | $7,25$ | 2 |
| 65 | $(1,8),(4,7)$ | $8,28$ | 2 |
| 85 | $(2,9),(6,7)$ | $18,42$ | 2 |
| 145 | $(1,12),(8,9)$ | $12,72$ | 2 |

**Injetividade das áreas para $R$ fixo:** se $ab=cd=n$ e $a^2+b^2=c^2+d^2=R$, então $(a+b)^2=R+2n=(c+d)^2$, logo $a+b=c+d$ (todos positivos). Os pares são raízes do mesmo polinômio $x^2-(a+b)x+n$ e, portanto, coincidem até permutação.

## 5. Questão A — critério direto a partir de duas áreas

### 5.1. Critério espectral

Por definição,

$$
\boxed{n\sim m\iff\mathcal R(n)\cap\mathcal R(m)\ne\varnothing}.
$$

É um critério necessário e suficiente, mas a avaliação direta de $\mathcal R(n)$ enumera divisores.

### 5.2. Teorema da diferença das áreas

**Teorema.** Se $n,m\in\mathbb N^+$ e $n\ne m$, então $n\sim m$ se, e somente se, existem inteiros positivos $s,t$ tais que

1. $(s-t)(s+t)=2(n-m)$;
2. $\Delta_n=s^2-4n$ e $\Delta_m=t^2-4m$ são quadrados perfeitos não negativos;
3. $s\equiv\sqrt{\Delta_n}\pmod2$ e $t\equiv\sqrt{\Delta_m}\pmod2$.

As raízes quadradas aqui são as raízes inteiras não negativas.

**Demonstração.** Se $ab=n$ e $a+b=s$, os lados são as raízes de $x^2-sx+n=0$, isto é,

$$
a,b=\frac{s\pm\sqrt{s^2-4n}}2.
$$

As condições 2 e 3 garantem raízes inteiras; como $s>0$, $n>0$ e $\Delta_n<s^2$, ambas são positivas. O mesmo vale para $c,d$ associados a $m,t$. A condição 1 equivale a $s^2-2n=t^2-2m$, logo as duas diagonais ao quadrado coincidem. A recíproca segue tomando $s=a+b$ e $t=c+d$. $\square$

**Consequência computacional:** para $n\ne m$, os candidatos $(s,t)$ podem ser obtidos fatorando $2|n-m|$, sem enumerar inicialmente $D(n)$ e $D(m)$. É necessário testar integralidade, positividade e discriminantes; a fatoração por si só não basta.

### 5.3. Exemplo: $n=25$, $m=7$

$$
2(n-m)=36,\quad(s-t,s+t)=(2,18),\quad(s,t)=(10,8).
$$

Então

$$
\Delta_{25}=10^2-4\cdot25=0,\qquad
\Delta_7=8^2-4\cdot7=36.
$$

Os pares reconstruídos são $(5,5)$ e $(1,7)$, e

$$
R=10^2-2\cdot25=8^2-2\cdot7=50.
$$

## 6. Questão B — restrições aritméticas

### 6.1. Teorema da paridade

**Teorema.** Se $n\sim m$, então $n\equiv m\pmod2$.

**Demonstração.** A igualdade de raios fornece $s^2-t^2=2(n-m)$. Quadrados inteiros são $0$ ou $1$ módulo $4$, e a diferença de dois quadrados nunca é $2\pmod4$. Se $n-m$ fosse ímpar, o lado direito seria $2\pmod4$, absurdo. $\square$

**A recíproca é falsa:** por exemplo, $\mathcal R(1)=\{2\}$ e $\mathcal R(3)=\{10\}$, embora $1$ e $3$ sejam ímpares.

### 6.2. Parametrização por fatores

Como $s-t$ e $s+t$ têm a mesma paridade e seu produto é par, ambos são pares. Escreva

$$
s-t=2u,\qquad s+t=2v.
$$

Então

$$
\boxed{n-m=2uv},\qquad s=u+v,\quad t=v-u.
$$

Os inteiros $u,v$ podem ter sinais conforme a ordem das áreas e das somas. Para uma busca algorítmica, é conveniente ordenar $n>m$, tomar $u,v>0$ e $v>u$, e percorrer $uv=(n-m)/2$; em seguida aplicar os testes do teorema anterior.

## 7. Questão C — diferenças de áreas e afastamento da diagonal

Para duas representações positivas do mesmo $R$, com somas $s_n,s_m$ e diferenças absolutas $\delta_n=|a-b|$, $\delta_m=|c-d|$,

$$
\boxed{n-m=\frac{s_n^2-s_m^2}{2}=\frac{\delta_m^2-\delta_n^2}{2}}.
$$

Portanto, para $R$ fixo, o retângulo mais próximo da diagonal $a=b$ tem maior área. A dependência é **quadrática** em $\delta$, e não linear. Para lados reais a área varia continuamente; para lados inteiros, apenas valores discretos são permitidos.

## 8. Famílias por homotetia

Se $(a,b)$ e $(c,d)$ compartilham $R$, para qualquer $k\in\mathbb N^+$ os pares $(ka,kb)$ e $(kc,kd)$ compartilham $k^2R$, com áreas $k^2n$ e $k^2m$. Assim,

$$
\boxed{n\sim m\implies k^2n\sim k^2m}.
$$

Exemplo: $7\sim25$ em $R=50$ implica $28\sim100$ em $R=200$, ao multiplicar os lados por $2$. Esta construção gera infinitas instâncias a partir de uma ponte entre áreas distintas.

## 9. Multiplicação de $R$ por primos $1\pmod4$

Se $p\equiv1\pmod4$ é primo, então $p=x^2+y^2$ com $x,y>0$. A identidade de Brahmagupta–Fibonacci produz representações de $pR$ a partir das de $R$. Entretanto, a quantidade de áreas distintas não precisa crescer estritamente: representações podem coincidir e as correções de eixo e diagonal importam.

Exemplo:

$$
R=50=1^2+7^2=5^2+5^2,\qquad p=5.
$$

$$
pR=250=5^2+15^2=9^2+13^2.
$$

As áreas positivas correspondentes são $75$ e $117$, novamente duas.

**Direção adicional:** investigar a transformação do conjunto $\mathcal A(R)$ sob $R\mapsto pR$, distinguindo casos $p\mid R$ e $p\nmid R$, e analisando as representações gaussianas até unidades e conjugação.

## 10. Grafo de pontes geométricas

Defina o grafo simples não direcionado $G=(V,E)$, com $V=\mathbb N^+$ e

$$
\{n,m\}\in E\iff n\ne m\text{ e }\mathcal R(n)\cap\mathcal R(m)\ne\varnothing.
$$

Cada $R$ produz uma **clique** sobre os vértices de $\mathcal A(R)$: quaisquer duas áreas distintas desse conjunto compartilham $R$.

A relação $\sim$ é reflexiva e simétrica, mas **não transitiva**. Um contraexemplo certificado é:

- $8\sim28$ via $R=65$, usando $(1,8)$ e $(4,7)$.
- $28\sim100$ via $R=200$, usando $(2,14)$ e $(10,10)$.
- Entretanto, $\mathcal R(8)=\{20,65\}$ e $\mathcal R(100)=\{200,425,641,2504,10001\}$, que não se intersectam; portanto $8\not\sim100$.

Assim, a conectividade por caminhos no grafo não equivale a compartilhar diretamente uma circunferência.

## 11. Algoritmo proposto

Para determinar **todas** as circunferências comuns a $n,m$ distintos:

1. Se $n$ e $m$ têm paridades diferentes, retorne conjunto vazio.
2. Reordene para $n>m$ e calcule $h=(n-m)/2>0$.
3. Para cada par de fatores positivos $u,v$ com $uv=h$ e $v>u$, tome $s=u+v$, $t=v-u$.
4. Calcule $\Delta_n=s^2-4n$ e $\Delta_m=t^2-4m$.
5. Aceite somente se ambos forem quadrados perfeitos não negativos e as condições de paridade das raízes forem satisfeitas.
6. Recupere os pares $(a,b)$ e $(c,d)$ pelas fórmulas quadráticas.
7. Registre $R=s^2-2n=t^2-2m$; elimine duplicações, se houver.

**Observação de desempenho:** o algoritmo troca a enumeração dos divisores de $n,m$ pela fatoração de $h$. Isso não prova que seja sempre mais rápido. Comparar as duas abordagens com testes e benchmarks é parte da pesquisa.

**Implementação exata:** em TypeScript, usar `bigint` e raiz quadrada inteira para evitar perda de precisão em inteiros acima de `Number.MAX_SAFE_INTEGER`.

## 12. Agenda de investigação

1. Provar propriedades adicionais da relação $\sim$, com contraexemplos mínimos para propriedades que falham.
2. Estudar quais fatorações de $n$ e $m$ permitem pré-filtros além da paridade.
3. Determinar quantas circunferências diferentes podem conectar um mesmo par $(n,m)$.
4. Investigar o comportamento de $\mathcal A(pR)$ para $p\equiv1\pmod4$.
5. Identificar classes primitivas sob homotetias e simetrias gaussianas.
6. Implementar dois algoritmos independentes (espectros por divisores e fatoração da diferença) e comparar os resultados por testes exaustivos em intervalos finitos.
7. Visualizar no Zeta Lab as pontes como arestas de um grafo rotuladas por $R$, com acesso aos pares de divisores testemunhas.

## 13. Síntese

O núcleo matemático é a coexistência de uma restrição multiplicativa e outra quadrática:

$$
\boxed{ab=n,\qquad a^2+b^2=R,\qquad (a+b)^2=R+2n.}
$$

A terceira igualdade transforma a pergunta geométrica sobre diagonais compartilhadas em uma pergunta aritmética sobre somas de fatores, discriminantes quadrados e fatoração da diferença das áreas.

A contribuição concreta desta etapa é um **critério necessário e suficiente para duas áreas distintas**, uma restrição de paridade, fórmulas exatas de contagem e diferença de áreas, e um algoritmo de busca baseado em $|n-m|/2$.

Esses resultados são deduções para o problema do Zeta Lab a partir de matemática clássica; **não se reivindica originalidade científica** sem revisão bibliográfica específica.

## Referências para aprofundamento

- Teorema de Fermat–Euler sobre somas de dois quadrados.
- Fórmula de Jacobi para $r_2(n)$.
- Identidade de Brahmagupta–Fibonacci.
- Inteiros de Gauss $\mathbb Z[i]$, norma e fatoração em primos gaussianos.
- Documento histórico do projeto: [`ia.md`](https://github.com/nunniii/zeta-lab/blob/main/ia.md).
