import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { BrandStrategy, BrandSystem, LogoConcept } from "@/core/schemas";
import type { PdfFontFamilies } from "@/core/pdf/google-fonts";

const COLORS = {
  foreground: "#14161b",
  muted: "#6b6e76",
  mutedLight: "#9a9da4",
  border: "#e6e3db",
};

function createStyles(fonts: PdfFontFamilies) {
  return StyleSheet.create({
    page: {
      paddingVertical: 48,
      paddingHorizontal: 48,
      fontFamily: fonts.englishFamily,
      fontSize: 10,
      color: COLORS.foreground,
    },
    cover: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 16,
    },
    eyebrow: {
      fontSize: 9,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: COLORS.mutedLight,
    },
    coverTitle: {
      fontSize: 40,
      fontWeight: fonts.englishBold ? 700 : 400,
      marginTop: 12,
      marginBottom: 12,
    },
    coverSubtitle: {
      fontSize: 11,
      color: COLORS.muted,
      maxWidth: 320,
    },
    section: {
      marginBottom: 22,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 8,
    },
    sectionIndex: {
      fontSize: 9,
      color: COLORS.mutedLight,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: fonts.englishBold ? 700 : 400,
    },
    label: {
      fontSize: 9,
      color: COLORS.mutedLight,
      marginBottom: 2,
    },
    body: {
      fontSize: 10,
      lineHeight: 1.5,
      color: COLORS.foreground,
    },
    bodyMuted: {
      fontSize: 10,
      lineHeight: 1.5,
      color: COLORS.muted,
    },
    row: {
      flexDirection: "row",
      gap: 20,
    },
    col: {
      flex: 1,
    },
    listItem: {
      fontSize: 10,
      lineHeight: 1.5,
      color: COLORS.muted,
      marginBottom: 2,
    },
    logoImage: {
      width: 220,
      height: 220,
      objectFit: "contain",
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    swatch: {
      width: 56,
      height: 56,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 4,
    },
    swatchGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    swatchCell: {
      width: 100,
    },
    pill: {
      fontSize: 9,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    specimen: {
      fontSize: 30,
      marginBottom: 4,
    },
  });
}

function Section({
  index,
  title,
  styles,
  children,
}: {
  index: number;
  title: string;
  styles: ReturnType<typeof createStyles>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIndex}>{String(index).padStart(2, "0")}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export interface GuidelinesDocumentProps {
  brandName: string;
  strategy: BrandStrategy | null;
  system: BrandSystem;
  concept: LogoConcept;
  logoImageBuffer: Buffer;
  fonts: PdfFontFamilies;
}

export default function GuidelinesDocument({
  brandName,
  strategy,
  system,
  concept,
  logoImageBuffer,
  fonts,
}: GuidelinesDocumentProps) {
  const styles = createStyles(fonts);
  const logoImageSrc = { data: logoImageBuffer, format: "png" as const };

  return (
    <Document title={`${brandName} — Brand Guidelines`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.eyebrow}>Brand Guidelines</Text>
          <Text style={styles.coverTitle}>{brandName}</Text>
          <Text style={styles.coverSubtitle}>{system.messaging.shortDescriptor}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Section index={2} title="About the Brand" styles={styles}>
          <Text style={styles.body}>{strategy?.strategicNarrative ?? system.messaging.elevatorPitch}</Text>
        </Section>

        <Section index={3} title="Vision / Mission" styles={styles}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Vision</Text>
              <Text style={styles.body}>{system.strategicFoundation.vision}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Mission</Text>
              <Text style={styles.body}>{system.strategicFoundation.mission}</Text>
            </View>
          </View>
        </Section>

        <Section index={4} title="Brand Essence" styles={styles}>
          <Text style={[styles.body, { fontSize: 16, marginBottom: 4 }]}>
            {system.strategicFoundation.essence}
          </Text>
          <Text style={styles.bodyMuted}>{system.strategicFoundation.promise}</Text>
        </Section>

        <Section index={5} title="Logo Concept" styles={styles}>
          <Text style={[styles.body, { marginBottom: 4 }]}>{concept.name}</Text>
          <Text style={styles.bodyMuted}>{concept.concept}</Text>
        </Section>

        <Section index={6} title="Primary Logo" styles={styles}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an HTML img */}
          <Image src={logoImageSrc} style={styles.logoImage} />
        </Section>

        <Section index={7} title="Logo Variations" styles={styles}>
          <View style={styles.row}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an HTML img */}
            <Image src={logoImageSrc} style={styles.logoImage} />
          </View>
          <Text style={[styles.bodyMuted, { marginTop: 8 }]}>{concept.wordmarkCompositionPlan}</Text>
        </Section>

        <Section index={8} title="Clear Space" styles={styles}>
          <Text style={styles.bodyMuted}>{system.logoStrategy.clearSpaceConcept}</Text>
        </Section>

        <Section index={9} title="Minimum Size" styles={styles}>
          <Text style={styles.bodyMuted}>{concept.smallSizeBehavior}</Text>
        </Section>

        <Section index={10} title="Incorrect Usage" styles={styles}>
          {[...system.logoStrategy.misuseRules, ...concept.avoid].map((rule) => (
            <Text key={rule} style={styles.listItem}>
              · {rule}
            </Text>
          ))}
        </Section>
      </Page>

      <Page size="A4" style={styles.page}>
        <Section index={11} title="Color Palette" styles={styles}>
          <View style={styles.swatchGrid}>
            {system.colorSystem.map((color) => (
              <View key={color.name} style={styles.swatchCell}>
                <View style={[styles.swatch, { backgroundColor: color.hex }]} />
                <Text style={styles.body}>{color.name}</Text>
                <Text style={styles.label}>
                  {color.role} · {color.hex.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section index={12} title="Color Usage" styles={styles}>
          {system.colorSystem.map((color) => (
            <View key={color.name} style={{ marginBottom: 6 }}>
              <Text style={styles.body}>{color.name}</Text>
              <Text style={styles.bodyMuted}>{color.usage}</Text>
            </View>
          ))}
        </Section>

        <Section index={13} title="Typography" styles={styles}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>English — {system.typographySystem.englishPrimary.name}</Text>
              <Text style={[styles.specimen, { fontFamily: fonts.englishFamily }]}>Aa</Text>
              <Text style={styles.bodyMuted}>{system.typographySystem.englishPrimary.rationale}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Arabic — {system.typographySystem.arabicPrimary.name}</Text>
              <Text style={[styles.specimen, { fontFamily: fonts.arabicFamily }]}>أب</Text>
              <Text style={styles.bodyMuted}>{system.typographySystem.arabicPrimary.rationale}</Text>
            </View>
          </View>
        </Section>

        <Section index={14} title="Typography Hierarchy" styles={styles}>
          <Text style={styles.bodyMuted}>{system.typographySystem.hierarchy}</Text>
        </Section>

        <Section index={15} title="Voice & Tone" styles={styles}>
          <View style={styles.pillRow}>
            {system.voiceAndTone.characteristics.map((c) => (
              <Text key={c.trait} style={styles.pill}>
                {c.trait}
              </Text>
            ))}
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={styles.col}>
              <Text style={styles.label}>Do</Text>
              {system.voiceAndTone.writingPrinciples.map((p) => (
                <Text key={p} style={styles.listItem}>
                  · {p}
                </Text>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Don&apos;t</Text>
              {system.voiceAndTone.avoid.map((a) => (
                <Text key={a} style={styles.listItem}>
                  · {a}
                </Text>
              ))}
            </View>
          </View>
        </Section>

        <Section index={16} title="Messaging" styles={styles}>
          <Text style={[styles.body, { marginBottom: 8 }]}>{system.messaging.elevatorPitch}</Text>
          {system.messaging.pillars.map((p) => (
            <View key={p.pillar} style={{ marginBottom: 4 }}>
              <Text style={styles.body}>{p.pillar}</Text>
              <Text style={styles.bodyMuted}>{p.detail}</Text>
            </View>
          ))}
        </Section>

        <Section index={17} title="Visual Language" styles={styles}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Graphic system</Text>
              <Text style={styles.bodyMuted}>{system.visualLanguage.graphicSystem}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Composition</Text>
              <Text style={styles.bodyMuted}>{system.visualLanguage.composition}</Text>
            </View>
          </View>
        </Section>
      </Page>
    </Document>
  );
}
