import {Base45Decoder} from "../../../src/decoder/Base45Decoder";
import {ZlibDecoder} from "../../../src/decoder/ZlibDecoder";
import {CborDecoder} from "../../../src/decoder/CborDecoder";
import {DccCose} from "../../../src/model/DccBase45";
import {CoseDecoder} from "../../../src/decoder/CoseDecoder";

export const validTestCert = "HC1:NCFK60DG0/3WUWGSLKH47GO0Y%5S.PK%96L79CK-500XK0JCV496F3PYJ-982F3:OR2B8Y50.FK6ZK7:EDOLOPCO8F6%E3.DA%EOPC1G72A6YM86G7/F6/G80X6H%6946746T%6C46/96SF60R6FN8UPC0JCZ69FVCPD0LVC6JD846Y96C463W5307+EDG8F3I80/D6$CBECSUER:C2$NS346$C2%E9VC- CSUE145GB8JA5B$D% D3IA4W5646646-96:96.JCP9EJY8L/5M/5546.96SF63KC.SC4KCD3DX47B46IL6646H*6Z/ER2DD46JH8946JPCT3E5JDLA7$Q69464W51S6..DX%DZJC2/DYOA$$E5$C JC3/D9Z95LEZED1ECW.C8WE2OA3ZAGY8MPCG/DU2DRB8MTA8+9$PC5$CUZC$$5Y$5FBB*10GBH A81QK UV-$SOGD1APAB4$5UV C-EWB4T*6H%QV/DAP9L7J3Y4O/WVI5IW3672HO-HV16IW3JHV-FI%WJCPBI8QTE008I+FPR01MYFA6EBN2SR3H+4KH1M9RCIM2 VV15REG 516N93SS70RBUCH-RJM2JMULZ6*/HBBW7W7:S2BU7T6PRTMF4ALUNEXH3P7 LE0YF0TGE461PBK9TD68HDIT4AIFD9NH14V%GBCONJOV$KN  C+3U-IT$SE-A2V+9UO9WYRJ4HN+M/Z5W$QEDT/8C:88OQ4DXOBBIQ453863NPW0EJXG8$GH1T 38C*UI6T /FCDC%6VLNOA6W6BEYJJUH2Z-SOJO1D7JMALD8 $1%5B.GH$7AQOHZ:K3BNO1"
const decodeDcc = (cert:string): DccCose => CborDecoder.decode(ZlibDecoder.decode(Base45Decoder.decode(cert)))

describe("Test the cose dcoder", ( ) => {
    test("Decode valid hcert", () =>{
        const dccCose = decodeDcc(validTestCert.substr(4))
        const hcert = CoseDecoder.decode(dccCose)

        expect(hcert.schemaVersion).toBe("1.3.0")
        expect(hcert.person.familyName).toBe("Studer")
        expect(hcert.person.familyNameStandardised).toBe("STUDER")
        expect(hcert.person.givenName).toBe("Martina")
        expect(hcert.person.givenNameStandardised).toBe("MARTINA")
        expect(hcert.person.dateOfBirth).toBe("1964-03-14")

        expect(hcert.infromation.disease.active).toBe(true)
        expect(hcert.infromation.disease.lang).toBe('en')
        expect(hcert.infromation.disease.display).toBe('COVID-19')
        expect(hcert.infromation.disease.system).toBe('http://snomed.info/sct')
        expect(hcert.infromation.disease.version).toBe('http://snomed.info/sct/900000000000207008/version/20210131')

        expect(hcert.infromation.vaccineOrProphylaxis.active).toBe(true)
        expect(hcert.infromation.vaccineOrProphylaxis.lang).toBe('en')
        expect(hcert.infromation.vaccineOrProphylaxis.display).toBe('covid-19 vaccines')
        expect(hcert.infromation.vaccineOrProphylaxis.system).toBe('http://snomed.info/sct')
        expect(hcert.infromation.vaccineOrProphylaxis.version).toBe('http://snomed.info/sct/900000000000207008/version/20210131')

        expect(hcert.infromation.vaccineProduct.active).toBe(true)
        expect(hcert.infromation.vaccineProduct.lang).toBe('en')
        expect(hcert.infromation.vaccineProduct.display).toBe('COVID-19 Vaccine Janssen')
        expect(hcert.infromation.vaccineProduct.system).toBe('https://ec.europa.eu/health/documents/community-register/html/')
        expect(hcert.infromation.vaccineProduct.version).toBe('')

        expect(hcert.infromation.vaccineManufacturer.active).toBe(true)
        expect(hcert.infromation.vaccineManufacturer.lang).toBe('en')
        expect(hcert.infromation.vaccineManufacturer.display).toBe('Janssen-Cilag International')
        expect(hcert.infromation.vaccineManufacturer.system).toBe('https://spor.ema.europa.eu/v1/organisations')
        expect(hcert.infromation.vaccineManufacturer.version).toBe('')

        expect(hcert.infromation.doseNumber).toBe(2)
        expect(hcert.infromation.overallDoseNumber).toBe(2)

        expect(hcert.infromation.vaccinationDate).toBe("2021-06-07")
        expect(hcert.infromation.vaccinationCountry).toBe("Switzerland")

        expect(hcert.infromation.certificateIssuer).toBe("Bundesamt für Gesundheit (BAG)")
        expect(hcert.infromation.uniqueCertificateIdentifier).toBe("urn:uvci:01:CH:52DBC5C6503016A06162545C")
    })
})
