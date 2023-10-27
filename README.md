This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project task

Potrebno je izraditi web-aplikaciju koja će služiti za praćenje natjecanja koja se odvijaju po jednokružnom sustavu natjecanja.

Natjecanje može definirati prijavljeni korisnik tako da na početnoj stranici unese naziv natjecanja, popis natjecatelja (natjecatelji su odvojeni točkom zarez ili novim redom) i odabere sustav bodovanja u obliku `pobjeda/remi/poraz`, npr. 3/1/0 (nogomet), 1/0,5/0 (šah), 2/0/1 (košarka) i slično.

U slučaju da su podaci valjani, aplikacija treba generirati cjelokupni raspored po kolima i omogućiti unos rezultata korisniku koji je stvorio natjecanje (ali samo njemu, ne i ostalim korisnicima).

Napomena: Korisnik ne unosi raspored (raspored generira aplikacija), već samo unosi/mijenja rezultate nakon čega aplikacija ažurira poredak natjecatelja temeljem dotadašnjih rezultata.

Više o sustavu "svatko sa svakim" možete pročitati na https://hrcak.srce.hr/file/350365 uz opasku da ne morate implementirati algoritam, već možete koristiti unaprijed pripremljene rasporede za podržane brojeve natjecatelja. Broj natjecatelja ograničiti na 4 do 8.

Stranica s rezultatima i trenutnim poretkom nekog natjecanja mora biti javno dostupna preko posebno generirane poveznice za to natjecanje. Poveznica mora biti vidljiva korisniku koji je stvorio natjecanje kako bi je mogao podijeliti s natjecateljima.

Prijava korisnika u aplikaciju odvija se korištenjem protokola _OpenId Connect (OIDC)_ i servisa _Auth0_. Korisnike na servisu _Auth0_ možete dodati kroz opciju _User management/Users_ na _Auth0_. Za potrebe testiranja aplikacije pripremiti jedan račun ili na _Auth0_ omogućiti prijavu preko _Googlea_.

Za pohranu podataka koristiti _PostgreSQL_ na _Renderu_ ili neku drugu bazu podataka po izboru (npr. _Firebase_).

**Aplikaciju postaviti u oblak (preporuča se besplatna opcija na Renderu), a kao odgovor na ovo pitanje isporučiti redom:**

- adresu javno dostupnog git repozitorija s izvornim kodom aplikacije
- adresu aplikacije
- adresu barem jednog stvorenog natjecanja s unesenim rezultatima za prva 2 kola i generiranim rasporednom preostalih
- testni korisnički račun s lozinkom s kojima se aplikacija može isprobati ili na Auth0 omogućiti prijavu preko Googlea

**Potrebno je navesti što je od navedenog implementirano:**

- prijava korisnika
- javno dostupni prikaz stanja natjecanja temeljem poveznice
- stvaranje novog natjecanja
- unos i izmjena rezultata, uz izračun novog poretka nakon unosa/izmjene
